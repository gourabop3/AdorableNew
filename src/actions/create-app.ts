"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUser } from "@/auth/stack-auth";
import { appsTable } from "@/db/schema";
import { db } from "@/lib/db";
import { githubSandboxes } from "@/lib/github";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";
import { insertAppUser } from "@/lib/db-compatibility";

export async function createApp({
  initialMessage,
  templateId,
}: {
  initialMessage?: string;
  templateId: string;
}) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting createApp...`);
  
  console.time("get user");
  const user = await getUser();
  console.timeEnd("get user");

  const template = templates.find(t => t.id === templateId);
  if (!template) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${templates.map(t => t.id).join(", ")}`
    );
  }

  console.time("git");
  const repo = await githubSandboxes.createRepository(
    `adorable-app-${Date.now()}`,
    initialMessage || 'Unnamed App',
    false // public repository
  );
  console.timeEnd("git");

  console.time("codespace");
  const codespace = await githubSandboxes.createCodespace(
    repo.full_name,
    'main',
    'basicLinux'
  );
  console.timeEnd("codespace");

  console.time("database: create app");
    
  const app = await db.transaction(async (tx) => {
    const appInsertion = await tx
      .insert(appsTable)
      .values({
        gitRepo: repo.full_name,
        name: initialMessage || 'Unnamed App',
        description: initialMessage || 'No description',
        baseId: templateId,
      })
      .returning();

    await insertAppUser(tx, {
      appId: appInsertion[0].id,
      userId: user.userId,
      permissions: "admin",
      githubUsername: user.githubUsername,
      githubAccessToken: user.githubAccessToken,
      githubInstallationId: user.githubInstallationId,
    });

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
    await sendMessage(app.id, codespace.web_ide_url, {
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

  console.log(`[${requestId}] App created successfully:`, app.id);
  return app;
}
