"use server";

import { getUser } from "@/auth/stack-auth";
import { appDeployments, appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { githubSandboxes } from "@/lib/github";
import { eq, sql } from "drizzle-orm";
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

export async function publishApp({ appId }: { appId: string }) {
  const user = await getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const app = await db
    .select({
      app: appsTable,
      users: sql<
        Array<{
          userId: string;
        }>
      >`json_agg(${appUsers})`.as("users"),
    })
    .from(appsTable)
    .where(eq(appsTable.id, appId))
    .leftJoin(appUsers, eq(appUsers.appId, appsTable.id))
    .groupBy(appsTable.id)
    .limit(1)
    .then((res) => res.at(0));

  if (!app) {
    throw new Error("App not found");
  }

  if (!app.users) {
    throw new Error("No users found for this app");
  }

  if (!app.users.some((user) => user.userId === user.userId)) {
    throw new Error("User does not have permission to publish this app");
  }

  if (!process.env.PREVIEW_DOMAIN) {
    throw new Error("Preview domain is not configured");
  }

  let previewDomain = app.app.previewDomain;
  if (app.app.previewDomain === null) {
    const domainPrefix = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: "",
      length: 2,
    });
    const domain = `${domainPrefix}.${process.env.PREVIEW_DOMAIN}`;

    console.log("Generated domain:", domain);

    await db
      .update(appsTable)
      .set({ previewDomain: domain })
      .where(eq(appsTable.id, appId))
      .execute();

    previewDomain = domain;
  }

  if (!previewDomain) {
    throw new Error("Preview domain is not set. This should not happen.");
  }

  // For now, we'll just return success since GitHub Pages deployment
  // requires additional setup with GitHub Actions or manual configuration
  // In a real implementation, you would:
  // 1. Set up GitHub Pages for the repository
  // 2. Configure the build process
  // 3. Deploy to the custom domain
  
  console.log(`App ${app.app.gitRepo} would be deployed to ${previewDomain}`);
  
  // For demonstration, we'll create a deployment record
  await db.insert(appDeployments).values({
    appId: app.app.id,
    deploymentId: `github-pages-${Date.now()}`,
    createdAt: new Date(),
    commit: "latest", //TODO: commit sha
  });

  return true;
}
