"use server";

import { getUserBasic } from "@/auth/stack-auth";
import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { desc } from "drizzle-orm";

export async function debugUserApps() {
  const user = await getUserBasic();
  
  try {
    // Get all app user entries for this user
    const allAppUsers = await db
      .select({
        appId: appUsers.appId,
        userId: appUsers.userId,
        createdAt: appUsers.createdAt,
        permissions: appUsers.permissions,
      })
      .from(appUsers)
      .where(eq(appUsers.userId, user.userId))
      .orderBy(appUsers.createdAt);

    console.log(`🔍 Found ${allAppUsers.length} app user entries for user ${user.userId}`);

    // Get all apps for this user
    const allApps = await db
      .select({
        id: appsTable.id,
        name: appsTable.name,
        description: appsTable.description,
        gitRepo: appsTable.gitRepo,
        createdAt: appsTable.createdAt,
      })
      .from(appUsers)
      .innerJoin(appsTable, eq(appUsers.appId, appsTable.id))
      .where(eq(appUsers.userId, user.userId))
      .orderBy(desc(appsTable.createdAt));

    console.log(`🔍 Found ${allApps.length} apps for user ${user.userId}`);

    // Check for duplicate app IDs
    const appIds = allApps.map(app => app.id);
    const uniqueAppIds = [...new Set(appIds)];
    const duplicateAppIds = appIds.filter((id, index) => appIds.indexOf(id) !== index);

    console.log(`🔍 Unique app IDs: ${uniqueAppIds.length}`);
    console.log(`🔍 Duplicate app IDs: ${duplicateAppIds.length}`);

    if (duplicateAppIds.length > 0) {
      console.log(`🔍 Duplicate app IDs found:`, duplicateAppIds);
      
      // Check which apps have multiple user entries
      for (const appId of duplicateAppIds) {
        const duplicateEntries = allAppUsers.filter(entry => entry.appId === appId);
        console.log(`🔍 App ${appId} has ${duplicateEntries.length} user entries:`, duplicateEntries);
      }
    }

    // Check for apps with same name
    const appNames = allApps.map(app => app.name);
    const duplicateNames = appNames.filter((name, index) => appNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      console.log(`🔍 Apps with duplicate names:`, duplicateNames);
    }

    return {
      totalAppUsers: allAppUsers.length,
      totalApps: allApps.length,
      uniqueApps: uniqueAppIds.length,
      duplicateAppIds: duplicateAppIds,
      duplicateNames: duplicateNames,
      allApps: allApps,
      allAppUsers: allAppUsers
    };

  } catch (error) {
    console.error("Error debugging user apps:", error);
    return { error: error.message };
  }
}