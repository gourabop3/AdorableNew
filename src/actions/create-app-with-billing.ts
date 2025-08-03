"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers, users } from "@/db/schema";
import { db } from "@/lib/db";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";
import { eq } from "drizzle-orm";
import { InsufficientCreditsError } from "@/lib/errors";

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

  // Check for existing app with same parameters to prevent duplicates
  console.time("check existing app");
  const existingApp = await db.query.apps.findFirst({
    where: eq(appsTable.name, initialMessage || 'Unnamed App'),
    with: {
      appUsers: {
        where: eq(appUsers.userId, user.userId)
      }
    }
  });
  
  if (existingApp && existingApp.appUsers.length > 0) {
    console.log('Found existing app with same parameters:', existingApp.id);
    return {
      id: existingApp.id,
      warning: 'Using existing app with same parameters',
      billingMode: 'skip'
    };
  }
  console.timeEnd("check existing app");

  let billingMode: 'full' | 'fallback' | 'skip' = 'skip';
  let warning: string | undefined;

  // Try billing operations, but don't fail if they don't work
  if (!skipBilling) {
    try {
      // Check if database is available
      const dbUser = await ensureUserInDatabase(user);
      
      if (dbUser) {
        // Check if user has enough credits before proceeding
        const APP_CREDIT_COST = 5;
        const creditCheck = await checkCredits(user.userId, APP_CREDIT_COST);
        if (!creditCheck.success) {
          throw new InsufficientCreditsError(creditCheck.currentCredits, APP_CREDIT_COST);
        }

        // Try to deduct credits
        const creditResult = await tryDeductCredits(user.userId, APP_CREDIT_COST);
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
      if (error instanceof InsufficientCreditsError) {
        throw error; // Re-throw insufficient credits error
      }
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
    const appInsertion = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.repoId,
        name: initialMessage || 'Unnamed App',
        description: initialMessage || 'No description',
        baseId: templateId,
      })
      .returning();

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

async function checkCredits(userId: string, requiredAmount: number): Promise<{ success: boolean; currentCredits: number; message?: string }> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, currentCredits: 0, message: 'User not found in database' };
    }

    if (user.credits < requiredAmount) {
      return { success: false, currentCredits: user.credits, message: `Insufficient credits. Need ${requiredAmount}, have ${user.credits}` };
    }

    return { success: true, currentCredits: user.credits };
  } catch (error) {
    console.warn('Credit check failed:', error);
    return { success: false, currentCredits: 0, message: 'Credit system temporarily unavailable' };
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

    return { success: true };
  } catch (error) {
    console.warn('Credit deduction failed:', error);
    return { success: false, message: 'Credit system temporarily unavailable' };
  }
}