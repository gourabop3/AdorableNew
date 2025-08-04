"use server";

import { getUser } from "@/auth/stack-auth";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function getUserApps() {
  const user = await getUser();

  // Use DISTINCT to prevent duplicate apps from showing
  const userApps = await db
    .selectDistinct({
      id: appsTable.id,
      name: appsTable.name,
      description: appsTable.description,
      gitRepo: appsTable.gitRepo,
      createdAt: appsTable.createdAt,
      permissions: appUsers.permissions,
    })
    .from(appUsers)
    .innerJoin(appsTable, eq(appUsers.appId, appsTable.id))
    .where(eq(appUsers.userId, user.userId))
    .orderBy(desc(appsTable.createdAt));

  // Additional deduplication to ensure no duplicates
  const uniqueApps = userApps.filter((app, index, self) => 
    index === self.findIndex(a => a.id === app.id)
  );

  console.log(`Found ${userApps.length} apps, returning ${uniqueApps.length} unique apps for user ${user.userId}`);
  
  return uniqueApps;
}
