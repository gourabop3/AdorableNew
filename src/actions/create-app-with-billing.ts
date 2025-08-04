"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUserBasic } from "@/auth/stack-auth";
import { connectToDatabase, db } from "@/lib/mongodb";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";

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
  const user = await getUserBasic();
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
      await connectToDatabase();
      
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
  await connectToDatabase();
    
  const app = await db.apps.create({
    gitRepo: repo.repoId,
    name: initialMessage || 'Unnamed App',
    description: initialMessage || 'No description',
    baseId: templateId,
  });

  await db.appUsers.create({
    appId: app._id,
    userId: user.userId,
    permissions: "admin",
    freestyleAccessToken: token.token,
    freestyleAccessTokenId: token.id,
    freestyleIdentity: user.freestyleIdentity,
  });

  console.timeEnd("database: create app");

  console.time("mastra: create thread");
  await memory.createThread({
    threadId: app._id.toString(),
    resourceId: app._id.toString(),
  });
  console.timeEnd("mastra: create thread");

  if (initialMessage) {
    console.time("send initial message");
    await sendMessage(app._id.toString(), mcpEphemeralUrl, {
      id: crypto.randomUUID(),
      parts: [
        {
          text: initialMessage,
        },
      ],
      role: "user",
    });
    console.timeEnd("send initial message");
  }

  return {
    id: app._id.toString(),
    billingMode,
    warning,
  };
}

async function ensureUserInDatabase(user: any) {
  try {
    let dbUser = await db.users.findById(user.userId);
    
    if (!dbUser) {
      // Create new user with 50 free credits
      dbUser = await db.users.create({
        id: user.userId,
        email: user.email || `user-${user.userId}@example.com`,
        name: user.name || 'User',
        image: user.image || '',
        credits: 50,
        plan: 'free',
      });
    }
    
    return dbUser;
  } catch (error) {
    console.error('Error ensuring user in database:', error);
    return null;
  }
}

async function tryDeductCredits(userId: string, amount: number): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await db.users.findById(userId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.credits < amount) {
      return { success: false, message: 'Insufficient credits' };
    }

    // Deduct credits
    await db.users.update(userId, { credits: user.credits - amount });
    
    // Record transaction
    await db.creditTransactions.create({
      userId,
      amount: -amount,
      description: 'App creation - 5 credits',
      type: 'usage',
    });

    return { success: true };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return { success: false, message: 'Credit deduction failed' };
  }
}