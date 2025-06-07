"use server";

import { getApp } from "@/actions/get-app";
import AppWrapper from "../../../components/app-wrapper";
import { unstable_ViewTransition as ViewTransition } from "react";
import { freestyle } from "@/lib/freestyle";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/auth/stack-auth";
import { memory } from "@/mastra/agents/builder";

export default async function AppPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; unsentMessage: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;
  const { unsentMessage } = await searchParams;

  const user = await getUser();

  const userPermission = (
    await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.userId, user.userId))
      .limit(1)
  ).at(0);

  if (!userPermission?.permissions) {
    return (
      <div>
        Project not found or you don&apos;t have permission to access it.
      </div>
    );
  }

  console.log("authenticated user:", user);

  const app = await getApp(id);

  console.log("app:", app);

  const { uiMessages } = await memory.query({
    threadId: id,
    resourceId: id,
  });

  const { codeServerUrl } = await freestyle.requestDevServer({
    repoId: app?.info.gitRepo,
    baseId: app?.info.baseId,
  });

  console.log("requested dev server");

  // Use the previewDomain from the database, or fall back to a generated domain
  const domain = app.info.previewDomain;

  return (
    <ViewTransition>
      <AppWrapper
        baseId={app.info.baseId}
        codeServerUrl={codeServerUrl}
        appName={app.info.name}
        initialMessages={uiMessages}
        repo={app.info.gitRepo}
        appId={app.info.id}
        repoId={app.info.gitRepo}
        domain={domain ?? undefined}
      />
    </ViewTransition>
  );
}
