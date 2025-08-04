"use server";

import { getApp } from "@/actions/get-app";
import AppWrapper from "../../../components/app-wrapper";
import { freestyle } from "@/lib/freestyle";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserBasic } from "@/auth/stack-auth";
import { memory } from "@/mastra/agents/builder";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/dist/client/link";
import { chatState } from "@/actions/chat-streaming";

export default async function AppPage({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;
  console.log('🔍 Loading app page for ID:', id);

  const user = await getUserBasic();
  console.log('✅ User authenticated for app page:', user?.userId);

  const userPermission = (
    await db
      .select()
      .from(appUsers)
      .where(and(eq(appUsers.userId, user.userId), eq(appUsers.appId, id)))
      .limit(1)
  ).at(0);

  console.log('🔐 User permission for this app:', userPermission?.permissions);
  console.log('🔐 User permission full object:', userPermission);

  if (!userPermission?.permissions) {
    console.log('❌ User has no permissions for this specific app:', id);
    console.log('❌ User ID:', user.userId);
    console.log('❌ App ID:', id);
    return <ProjectNotFound />;
  }

  const app = await getApp(id).catch((error) => {
    console.error('❌ Error getting app:', error);
    return undefined;
  });

  if (!app) {
    console.log('❌ App not found:', id);
    return <ProjectNotFound />;
  }

  console.log('✅ App found:', app.info.id);

  const { uiMessages } = await memory.query({
    threadId: id,
    resourceId: id,
  });

  console.log('✅ UI messages loaded:', uiMessages.length);

  const { codeServerUrl, ephemeralUrl } = await freestyle.requestDevServer({
    repoId: app?.info.gitRepo,
  });

  console.log("✅ Dev server requested");

  // Use the previewDomain from the database, or fall back to a generated domain
  const domain = app.info.previewDomain;

  console.log('🎉 Rendering app wrapper for:', app.info.id);
  console.log('🎉 App wrapper props:', {
    baseId: app.info.baseId,
    appName: app.info.name,
    appId: app.info.id,
    repoId: app.info.gitRepo,
    codeServerUrl: codeServerUrl ? 'set' : 'empty',
    ephemeralUrl: ephemeralUrl ? 'set' : 'empty',
    uiMessagesCount: uiMessages.length
  });

  return (
    <AppWrapper
      key={app.info.id}
      baseId={app.info.baseId}
      codeServerUrl={codeServerUrl}
      appName={app.info.name}
      initialMessages={uiMessages}
      consoleUrl={ephemeralUrl + "/__console"}
      repo={app.info.gitRepo}
      appId={app.info.id}
      repoId={app.info.gitRepo}
      domain={domain ?? undefined}
      running={(await chatState(app.info.id)).state === "running"}
    />
  );
}

function ProjectNotFound() {
  return (
    <div className="text-center my-16">
      Project not found or you don&apos;t have permission to access it.
      <div className="flex justify-center mt-4">
        <Link className={buttonVariants()} href="/">
          Go back to home
        </Link>
      </div>
    </div>
  );
}
