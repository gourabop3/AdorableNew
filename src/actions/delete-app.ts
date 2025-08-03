"use server";

import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { githubSandboxes } from "@/lib/github";
import { memory } from "@/mastra/agents/builder";
import { and, eq } from "drizzle-orm";

export async function deleteApp(appId: string) {
  const user = await getUser();

  const app = await db
    .select()
    .from(appsTable)
    .where(eq(appsTable.id, appId))
    .limit(1);

  if (!app[0]) {
    throw new Error("App not found");
  }

  const appUser = await db
    .select()
    .from(appUsers)
    .where(
      and(
        eq(appUsers.appId, appId),
        eq(appUsers.userId, user.userId)
      )
    )
    .limit(1);

  if (!appUser[0] || appUser[0].permissions !== "admin") {
    throw new Error("Not authorized to delete this app");
  }

  // Delete from GitHub
  const [owner, repo] = app[0].gitRepo.split('/');
  await githubSandboxes.deleteRepository(owner, repo);

  // Delete from database
  await db.transaction(async (tx) => {
    await tx.delete(appUsers).where(eq(appUsers.appId, appId));
    await tx.delete(appsTable).where(eq(appsTable.id, appId));
  });

  // Delete from memory
  await memory.deleteThread({
    threadId: appId,
  });

  return { success: true };
}
