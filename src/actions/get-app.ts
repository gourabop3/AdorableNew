"use server";

import { connectToDatabase, db } from "@/lib/mongodb";

export async function getApp(id: string) {
  await connectToDatabase();
  
  const app = await db.apps.findById(id);

  if (!app) {
    throw new Error("App not found");
  }

  const messages = await db.messages.findMany({ appId: app._id });

  return {
    info: {
      id: app._id.toString(),
      name: app.name,
      description: app.description,
      gitRepo: app.gitRepo,
      createdAt: app.createdAt,
      baseId: app.baseId,
      previewDomain: app.previewDomain,
    },
    messages: messages.map((msg) => {
      return msg.message;
    }),
  };
}
