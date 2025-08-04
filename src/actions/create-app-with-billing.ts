"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUser } from "@/auth/stack-auth";
import { appsTable, users, creditTransactions } from "@/db/schema";
import { db } from "@/lib/db";
import { githubSandboxes } from "@/lib/github";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";
import { eq } from "drizzle-orm";
import { insertAppUser } from "@/lib/db-compatibility";

interface CreateAppOptions {
  initialMessage?: string;
  templateId: string;
  skipBilling?: boolean; // For fallback mode
}

interface CreateAppResult {
  id: string;
  warning?: string;
  billingMode: 'full' | 'fallback' | 'skip';
}

export async function createAppWithBilling({
  initialMessage,
  templateId,
  skipBilling = false,
}: CreateAppOptions): Promise<CreateAppResult> {
  console.time("get user");
  const user = await getUser();
  console.timeEnd("get user");

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${templates.map(t => t.id).join(", ")}`
    );
  }

  let billingMode: 'full' | 'fallback' | 'skip' = 'skip';
  let warning: string | undefined;

  // Try billing operations, but don't fail if they don't work
  if (!skipBilling) {
    try {
      // Check if database is available
      const dbUser = await ensureUserInDatabase(user);
      
      if (dbUser) {
        // Try to deduct credits
        const creditResult = await tryDeductCredits(user.userId, 5);
        if (creditResult.success) {
          billingMode = 'full';
        } else {
          billingMode = 'fallback';
          warning = creditResult.message;
        }
      } else {
        billingMode = 'fallback';
        warning = 'Billing unavailable, using free mode';
      }
    } catch (error) {
      console.warn('Billing operations failed, continuing without billing:', error);
      billingMode = 'fallback';
      warning = 'Billing service temporarily unavailable';
    }
  }

  // Create the app regardless of billing status
  console.time("git");
  const repo = await githubSandboxes.createRepository(
    `adorable-app-${Date.now()}`,
    initialMessage || 'Unnamed App',
    false // public repository
  );
  console.timeEnd("git");

  console.time("codespace");
  const codespace = await githubSandboxes.createCodespace(
    repo.full_name,
    'main'
    // Let the system choose the best available machine type
  );
  console.timeEnd("codespace");

  console.time("database: create app");
  const app = await db.transaction(async (tx) => {
    const appInsertion = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.full_name,
        name: initialMessage || 'Unnamed App',
        description: initialMessage || 'No description',
        baseId: templateId,
      })
      .returning();

    await insertAppUser(tx, {
      appId: appInsertion[0].id,
      userId: user.userId,
      permissions: "admin",
      githubUsername: user.githubUsername,
      githubAccessToken: user.githubAccessToken,
      githubInstallationId: user.githubInstallationId,
    });

    return appInsertion[0];
  });
  console.timeEnd("database: create app");

  console.time("mastra: create thread");
  await memory.createThread({
    threadId: app.id,
    resourceId: app.id,
  });
  console.timeEnd("mastra: create thread");

  if (initialMessage) {
    console.time("send initial message");
    await sendMessage(app.id, codespace.web_ide_url, {
      id: crypto.randomUUID(),
      parts: [
        {
          text: initialMessage,
          type: "text",
        },
      ],
      role: "user",
    });
    console.timeEnd("send initial message");
  }

  return {
    id: app.id,
    warning,
    billingMode
  };
}

async function ensureUserInDatabase(user: any) {
  try {
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      console.log('Creating new user in database...');
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: user.email || `user-${user.userId}@example.com`,
        name: user.name || 'User',
        image: user.image || '',
        credits: 50, // Give new users 50 free credits
        plan: 'free',
      }).returning()[0];
    }

    return dbUser;
  } catch (error) {
    console.warn('Database user operations failed:', error);
    return null;
  }
}

async function tryDeductCredits(userId: string, amount: number): Promise<{ success: boolean; message?: string }> {
  try {
    // Check current credits
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, message: 'User not found in database' };
    }

    if (user.credits < amount) {
      return { success: false, message: `Insufficient credits. Need ${amount}, have ${user.credits}` };
    }

    // Deduct credits
    await db.update(users)
      .set({ credits: user.credits - amount })
      .where(eq(users.id, userId));

    // Record transaction (optional - won't fail if this doesn't work)
    try {
      await db.insert(creditTransactions).values({
        userId,
        amount: -amount, // Negative for usage
        description: 'App creation',
        type: 'usage',
      });
    } catch (transactionError) {
      console.warn('Transaction recording failed, but credits were deducted:', transactionError);
    }

    return { success: true };
  } catch (error) {
    console.warn('Credit deduction failed:', error);
    return { success: false, message: 'Credit system temporarily unavailable' };
  }
}