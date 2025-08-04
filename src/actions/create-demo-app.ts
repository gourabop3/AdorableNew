"use server";

import { getUserBasic } from "@/auth/stack-auth";
import { appsTable, appUsers, users } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function createDemoApp({
  initialMessage,
  templateId,
}: {
  initialMessage?: string;
  templateId: string;
}) {
  console.log('🚀 Starting demo app creation...');
  
  let user;
  try {
    user = await getUserBasic();
    console.log('✅ User authenticated:', user?.userId);
  } catch (error) {
    console.error('❌ User authentication failed:', error);
    throw new Error("User not authenticated. Please sign in first.");
  }

  if (!user || !user.userId) {
    console.error('❌ User data is invalid:', user);
    throw new Error("User not authenticated");
  }

  try {
    // Ensure user exists in database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      console.log('📝 Creating new user in database...');
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: user.email || `user-${user.userId}@example.com`,
        name: user.name || 'User',
        image: user.image || '',
        credits: 50,
        plan: 'free',
      }).returning()[0];
      console.log('✅ User created in database');
    }
    
    // Create demo app
    const app = await db.transaction(async (tx) => {
      const appInsertion = await tx
        .insert(appsTable)
        .values({
          gitRepo: `demo-repo-${Date.now()}`, // Demo repo ID
          name: initialMessage || 'Demo App',
          description: initialMessage || 'This is a demo app to showcase the platform',
          baseId: templateId,
        })
        .returning();

      await tx
        .insert(appUsers)
        .values({
          appId: appInsertion[0].id,
          userId: user.userId,
          permissions: "admin",
          freestyleAccessToken: 'demo-token',
          freestyleAccessTokenId: 'demo-token-id',
          freestyleIdentity: user.freestyleIdentity || 'demo-identity',
        })
        .returning();

      return appInsertion[0];
    });
    
    console.log('✅ Demo app created:', app.id);
    return app;
    
  } catch (error) {
    console.error('❌ Error during demo app creation:', error);
    throw error;
  }
}