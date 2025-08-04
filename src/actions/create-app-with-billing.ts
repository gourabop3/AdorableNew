"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers, users, creditTransactions } from "@/db/schema";
import { db } from "@/lib/db";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";
import { eq } from "drizzle-orm";
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

  let billingMode: 'full' | 'fallback' | 'skip' = 'skip';
  let warning: string | undefined;

  // Try billing operations, but don't fail if they don't work
  if (!skipBilling) {
    try {
      // Check if database is available
      const dbUser = await ensureUserInDatabase(user);
      
      if (dbUser) {
        // Check for existing app with same name and user to prevent duplicates
        const existingApp = await db.query.apps.findFirst({
          where: eq(appsTable.name, initialMessage || 'Unnamed App'),
          with: {
            appUsers: {
              where: eq(appUsers.userId, user.userId)
            }
          }
        });

        if (existingApp && existingApp.appUsers.length > 0) {
          console.log('Duplicate app detected, returning existing app:', existingApp.id);
          return {
            id: existingApp.id,
            warning: 'Using existing app with same name',
            billingMode: 'skip'
          };
        }

        // Try to deduct credits
        try {
          await deductCredits(user.userId, 5, 'App creation');
          billingMode = 'full';
        } catch (creditError: any) {
          billingMode = 'fallback';
          warning = creditError.message || 'Credit deduction failed';
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