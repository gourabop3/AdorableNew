"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers, users } from "@/db/schema";
import { db } from "@/lib/db";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";
import { deductCredits } from "@/lib/credits";
import { eq } from "drizzle-orm";

export async function createApp({
  initialMessage,
  templateId,
}: {
  initialMessage?: string;
  templateId: string;
}) {
  console.time("get user");
  let user;
  try {
    user = await getUser();
    console.log('✅ User authenticated:', user?.userId);
  } catch (error) {
    console.error('❌ User authentication failed:', error);
    throw new Error("User not authenticated. Please sign in first.");
  }
  console.timeEnd("get user");

  if (!user || !user.userId) {
    console.error('❌ User data is invalid:', user);
    throw new Error("User not authenticated");
  }

  if (!templates[templateId]) {
    console.error('❌ Template not found:', templateId);
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }

  console.log('🚀 Starting app creation...');
  console.time("git");
  
  try {
    const repo = await freestyle.createGitRepository({
      name: "Unnamed App",
      public: true,
      source: {
        type: "git",
        url: templates[templateId].repo,
      },
    });
    console.log('✅ Git repository created:', repo.repoId);
    
    await freestyle.grantGitPermission({
      identityId: user.freestyleIdentity,
      repoId: repo.repoId,
      permission: "write",
    });
    console.log('✅ Git permissions granted');

    const token = await freestyle.createGitAccessToken({
      identityId: user.freestyleIdentity,
    });
    console.log('✅ Git access token created');
    console.timeEnd("git");

    console.time("dev server");
    const { mcpEphemeralUrl } = await freestyle.requestDevServer({
      repoId: repo.repoId,
    });
    console.log('✅ Dev server requested');
    console.timeEnd("dev server");

    console.time("database: create app");
    
    // Ensure user exists in database before deducting credits
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      console.log('📝 Creating new user in database...');
      // Create new user with 50 free credits
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: user.email || `user-${user.userId}@example.com`, // Use user email or generate one
        name: user.name || 'User', // Use user name or default
        image: user.image || '', // Use user image or empty
        credits: 50,
        plan: 'free',
      }).returning()[0];
      console.log('✅ User created in database');
    } else {
      console.log('✅ User found in database');
    }
    
    // Deduct credits for app creation
    try {
      console.log('💰 Deducting credits...');
      await deductCredits(user.userId, 10, "App creation");
      console.log('✅ Credits deducted successfully');
    } catch (error) {
      console.error('❌ Credit deduction failed:', error);
      throw new Error("Insufficient credits. Please upgrade to Pro plan for more credits.");
    }
    
    const app = await db.transaction(async (tx) => {
      const appInsertion = await tx
        .insert(appsTable)
        .values({
          gitRepo: repo.repoId,
          name: initialMessage,
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
    console.log('✅ App created in database:', app.id);
    console.timeEnd("database: create app");

    console.time("mastra: create thread");
    await memory.createThread({
      threadId: app.id,
      resourceId: app.id,
    });
    console.log('✅ Mastra thread created');
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
      console.log('✅ Initial message sent');
      console.timeEnd("send initial message");
    }

    console.log('🎉 App creation completed successfully!');
    return app;
    
  } catch (error) {
    console.error('❌ Error during app creation:', error);
    throw error;
  }
}
