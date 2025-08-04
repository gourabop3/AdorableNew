"use server";

import { sendMessage } from "@/app/api/chat/route";
import { getUserBasic } from "@/auth/stack-auth";
import { connectToDatabase, db } from "@/lib/mongodb";
import { freestyle } from "@/lib/freestyle";
import { templates } from "@/lib/templates";
import { memory } from "@/mastra/agents/builder";

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
  const user = await getUserBasic();
  console.timeEnd("get user");

  if (!templates[templateId]) {
    throw new Error(
      `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
    );
  }

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

  return app._id.toString();
}
