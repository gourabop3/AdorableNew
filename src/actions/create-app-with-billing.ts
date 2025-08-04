"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers, users, creditTransactions } from "@/db/schema";
import { db } from "@/lib/db";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";
import { eq, and } from "drizzle-orm";

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

  if (!templates[templateId]) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
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
  const repo = await freestyle.createGitRepository({
    name: "Unnamed App",
    public: true,
    source: {
      type: "git",
      url: templates[templateId].repo,
    },
  });
  await freestyle.grantGitPermission({
    identityId: user.freestyleIdentity,
    repoId: repo.repoId,
    permission: "write",
  });

  const token = await freestyle.createGitAccessToken({
    identityId: user.freestyleIdentity,
  });
  console.timeEnd("git");

  console.time("dev server");
  const { mcpEphemeralUrl } = await freestyle.requestDevServer({
    repoId: repo.repoId,
  });
  console.timeEnd("dev server");

  console.time("database: create app");
  const app = await db.transaction(async (tx) => {
    // Check if user already has an app with the same name (prevent duplicates)
    const existingApp = await tx
      .select()
      .from(appUsers)
      .innerJoin(appsTable, eq(appUsers.appId, appsTable.id))
      .where(
        and(
          eq(appUsers.userId, user.userId),
          eq(appsTable.name, initialMessage || 'Unnamed App')
        )
      )
      .limit(1);

    if (existingApp.length > 0) {
      console.log(`App with name "${initialMessage || 'Unnamed App'}" already exists for user ${user.userId}`);
      return existingApp[0].apps;
    }

    const appInsertion = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.repoId,
        name: initialMessage || 'Unnamed App',
        description: initialMessage || 'No description',
        baseId: templateId,
      })
      .returning();

    // Check if app user entry already exists (prevent duplicate entries)
    const existingAppUser = await tx
      .select()
      .from(appUsers)
      .where(
        and(
          eq(appUsers.appId, appInsertion[0].id),
          eq(appUsers.userId, user.userId)
        )
      )
      .limit(1);

    if (existingAppUser.length === 0) {
      await tx
        .insert(appUsers)
        .values({
          appId: appInsertion[0].id,
          userId: user.userId,
          permissions: "admin",
          freestyleAccessToken: token.token,
          freestyleAccessTokenId: token.id,
          freestyleIdentity: user.freestyleIdentity,
        })
        .returning();
    } else {
      console.log(`App user entry already exists for app ${appInsertion[0].id} and user ${user.userId}`);
    }

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
    await sendMessage(app.id, mcpEphemeralUrl, {
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