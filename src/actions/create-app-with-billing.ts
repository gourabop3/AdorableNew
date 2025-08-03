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
import { deductCredits } from "@/lib/credits";

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
        const creditCheck = await checkCredits(user.userId, 1);
        if (!creditCheck.success) {
          throw new InsufficientCreditsError(creditCheck.currentCredits, 1);
        }

        // Deduct credits using the proper credits library
        try {
          console.log(`Attempting to deduct 1 credit for user ${user.userId}...`);
          await deductCredits(user.userId, 1, 'App creation');
          billingMode = 'full';
          console.log('✅ Credits deducted successfully for app creation');
        } catch (creditError: any) {
          console.error('Credit deduction failed:', creditError);
          console.error('Error details:', {
            message: creditError.message,
            stack: creditError.stack,
            userId: user.userId
          });
          if (creditError.message === 'Insufficient credits') {
            throw new InsufficientCreditsError(creditCheck.currentCredits, 1);
          }
          // Don't allow fallback for credit deduction failures
          throw new Error(`Credit deduction failed: ${creditError.message}`);
        }
      } else {
        // Don't allow fallback if user can't be created in database
        throw new Error('User database operations failed - billing system unavailable');
      }
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        throw error; // Re-throw insufficient credits error
      }
      console.error('Billing operations failed:', error);
      throw new Error(`Billing system error: ${error.message}`);
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
    console.log(`Ensuring user ${user.userId} exists in database...`);
    
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
      console.log(`✅ New user created with ${dbUser.credits} credits`);
    } else {
      console.log(`✅ Existing user found with ${dbUser.credits} credits`);
    }

    return dbUser;
  } catch (error) {
    console.error('Database user operations failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: user.userId
    });
    return null;
  }
}

async function checkCredits(userId: string, requiredAmount: number): Promise<{ success: boolean; currentCredits: number; message?: string }> {
  try {
    console.log(`Checking credits for user ${userId} (need ${requiredAmount})...`);
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      console.error(`User ${userId} not found in database`);
      return { success: false, currentCredits: 0, message: 'User not found in database' };
    }

    console.log(`User has ${user.credits} credits, needs ${requiredAmount}`);

    if (user.credits < requiredAmount) {
      console.error(`Insufficient credits: need ${requiredAmount}, have ${user.credits}`);
      return { success: false, currentCredits: user.credits, message: `Insufficient credits. Need ${requiredAmount}, have ${user.credits}` };
    }

    console.log(`✅ Credit check passed: ${user.credits} >= ${requiredAmount}`);
    return { success: true, currentCredits: user.credits };
  } catch (error) {
    console.error('Credit check failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: userId
    });
    return { success: false, currentCredits: 0, message: 'Credit system temporarily unavailable' };
  }
}

