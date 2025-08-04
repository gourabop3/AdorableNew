import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Compatibility layer for database queries that handles both old (freestyle_*) and new (github_*) column names
 * This is a temporary solution until the migration is applied to all databases
 */

export async function getUserPermission(userId: string, appId: string) {
  try {
    // Try the new schema first
    const result = await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.userId, userId), eq(appUsers.appId, appId)))
      .limit(1);
    
    return result.at(0);
  } catch (error: any) {
    // Check if it's the github_username column error
    if (error?.message?.includes('github_username does not exist') || error?.code === '42703') {
      console.log('⚠️  Old database schema detected, using raw SQL query as fallback');
      
      try {
        // Use raw SQL query with old column names
        const result = await db.execute({
          sql: `
            SELECT 
              user_id,
              app_id,
              created_at,
              permissions,
              freestyle_identity as github_username,
              freestyle_access_token as github_access_token,
              freestyle_access_token_id as github_installation_id
            FROM app_users 
            WHERE user_id = $1 AND app_id = $2 
            LIMIT 1
          `,
          args: [userId, appId]
        });
        
        return result.rows[0] || undefined;
      } catch (fallbackError) {
        console.error('❌ Both new and old schema queries failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function insertAppUser(tx: any, data: {
  appId: string;
  userId: string;
  permissions: string;
  githubUsername: string;
  githubAccessToken: string;
  githubInstallationId: string;
}) {
  try {
    // Try the new schema first
    return await tx
      .insert(appUsers)
      .values({
        appId: data.appId,
        userId: data.userId,
        permissions: data.permissions,
        githubUsername: data.githubUsername,
        githubAccessToken: data.githubAccessToken,
        githubInstallationId: data.githubInstallationId,
      })
      .returning();
  } catch (error: any) {
    // Check if it's the github_username column error
    if (error?.message?.includes('github_username does not exist') || error?.code === '42703') {
      console.log('⚠️  Old database schema detected, using raw SQL for insert');
      
      try {
        // Use raw SQL insert with old column names
        const result = await tx.execute({
          sql: `
            INSERT INTO app_users (
              app_id, user_id, permissions, 
              freestyle_identity, freestyle_access_token, freestyle_access_token_id,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
          `,
          args: [
            data.appId,
            data.userId,
            data.permissions,
            data.githubUsername,
            data.githubAccessToken,
            data.githubInstallationId
          ]
        });
        
        return result.rows;
      } catch (fallbackError) {
        console.error('❌ Both new and old schema inserts failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    // Re-throw other errors
    throw error;
  }
}