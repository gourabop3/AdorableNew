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
  console.log(`🚀 createAppWithBilling called with skipBilling=${skipBilling}`);
  console.time("get user");
  const user = await getUser();
  console.timeEnd("get user");

  console.log(`🔍 Template check: templateId=${templateId}`);
  if (!templates[templateId]) {
    console.log(`❌ Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`);
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }
  console.log(`✅ Template ${templateId} found`);

  // Check for existing app with same parameters to prevent duplicates
  console.time("check existing app");
  console.log(`🔍 Checking for existing app: name="${initialMessage || 'Unnamed App'}", userId=${user.userId}`);
  const existingApp = await db.query.apps.findFirst({
    where: eq(appsTable.name, initialMessage || 'Unnamed App'),
    with: {
      appUsers: {
        where: eq(appUsers.userId, user.userId)
      }
    }
  });
  
  if (existingApp && existingApp.appUsers.length > 0) {
    console.log(`✅ Found existing app with same parameters: ${existingApp.id}`);
    return {
      id: existingApp.id,
      warning: 'Using existing app with same parameters',
      billingMode: 'skip'
    };
  }
  console.log(`✅ No existing app found, proceeding with creation`);
  console.timeEnd("check existing app");

  let billingMode: 'full' | 'fallback' | 'skip' = 'skip';
  let warning: string | undefined;

  // Try billing operations, but don't fail if they don't work
  console.log(`🔍 Billing check: skipBilling=${skipBilling}`);
  if (!skipBilling) {
    try {
      // Check if database is available
      console.log(`🔍 Ensuring user ${user.userId} is in database...`);
      const dbUser = await ensureUserInDatabase(user);
      
      if (dbUser) {
        console.log(`✅ User found in database:`, { id: dbUser.id, credits: dbUser.credits, plan: dbUser.plan });
        
        // Check if user has enough credits before proceeding
        const APP_CREDIT_COST = 5;
        console.log(`🔍 Checking if user has enough credits (need ${APP_CREDIT_COST})...`);
        const creditCheck = await checkCredits(user.userId, APP_CREDIT_COST);
        
        if (!creditCheck.success) {
          console.log(`❌ Credit check failed:`, creditCheck.message);
          throw new InsufficientCreditsError(creditCheck.currentCredits, APP_CREDIT_COST);
        }
        
        console.log(`✅ Credit check passed: user has ${creditCheck.currentCredits} credits`);

        // Try to deduct credits
        try {
          console.log(`💰 Attempting to deduct ${APP_CREDIT_COST} credits from user ${user.userId}`);
          const result = await deductCredits(user.userId, APP_CREDIT_COST, `App creation: ${initialMessage || 'Unnamed App'}`);
          console.log(`✅ Credit deduction successful:`, result);
          billingMode = 'full';
        } catch (error) {
          console.error(`❌ Credit deduction failed:`, error);
          billingMode = 'fallback';
          warning = error.message;
        }
      } else {
        console.log(`❌ User not found in database, skipping billing`);
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
    console.log(`🔍 Looking for user ${user.userId} in database...`);
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      console.log(`👤 User not found, creating new user ${user.userId}...`);
      try {
        dbUser = await db.insert(users).values({
          id: user.userId,
          email: user.email || `user-${user.userId}@example.com`,
          name: user.name || 'User',
          image: user.image || '',
          credits: 50, // Give new users 50 free credits
          plan: 'free',
        }).returning()[0];
        console.log(`✅ New user created successfully:`, { id: dbUser.id, credits: dbUser.credits });
      } catch (insertError) {
        console.error(`❌ Failed to create new user:`, insertError);
        return null;
      }
    } else {
      console.log(`✅ Existing user found:`, { id: dbUser.id, credits: dbUser.credits, plan: dbUser.plan });
    }

    return dbUser;
  } catch (error) {
    console.error(`❌ Database user operations failed:`, error);
    return null;
  }
}

async function checkCredits(userId: string, requiredAmount: number): Promise<{ success: boolean; currentCredits: number; message?: string }> {
  try {
    console.log(`🔍 Checking credits for user ${userId} (need ${requiredAmount})...`);
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      console.log(`❌ User ${userId} not found in database`);
      return { success: false, currentCredits: 0, message: 'User not found in database' };
    }

    console.log(`👤 User ${userId} found with ${user.credits} credits`);

    if (user.credits < requiredAmount) {
      console.log(`❌ Insufficient credits: need ${requiredAmount}, have ${user.credits}`);
      return { success: false, currentCredits: user.credits, message: `Insufficient credits. Need ${requiredAmount}, have ${user.credits}` };
    }

    console.log(`✅ Sufficient credits: have ${user.credits}, need ${requiredAmount}`);
    return { success: true, currentCredits: user.credits };
  } catch (error) {
    console.error(`❌ Credit check failed for user ${userId}:`, error);
    return { success: false, currentCredits: 0, message: 'Credit system temporarily unavailable' };
  }
}

