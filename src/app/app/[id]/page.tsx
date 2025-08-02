"use server";

import { getApp } from "@/actions/get-app";
import AppWrapper from "../../../components/app-wrapper";
import { freestyle } from "@/lib/freestyle";
import { db } from "@/lib/db";
import { appUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/auth/stack-auth";
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

  try {
    const user = await getUser();
    console.log('✅ User authenticated for app page:', user?.userId);

    // Check if user has permission for THIS specific app
    const userPermission = (
      await db
        .select()
        .from(appUsers)
        .where(
          and(
            eq(appUsers.userId, user.userId),
            eq(appUsers.appId, id)
          )
        )
        .limit(1)
    ).at(0);

    console.log('🔐 User permission for this app:', userPermission?.permissions);

    if (!userPermission?.permissions) {
      console.log('❌ User has no permissions for this specific app:', id);
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

    // Load UI messages with error handling
    let uiMessages = [];
    try {
      const messagesResult = await memory.query({
        threadId: id,
        resourceId: id,
      });
      uiMessages = messagesResult.uiMessages || [];
      console.log('✅ UI messages loaded:', uiMessages.length);
    } catch (error) {
      console.error('❌ Error loading UI messages:', error);
      // Continue without messages
    }

    // Request dev server with error handling
    let codeServerUrl = '';
    let ephemeralUrl = '';
    try {
      const devServerResult = await freestyle.requestDevServer({
        repoId: app?.info.gitRepo,
      });
      codeServerUrl = devServerResult.codeServerUrl || '';
      ephemeralUrl = devServerResult.ephemeralUrl || '';
      console.log("✅ Dev server requested");
    } catch (error) {
      console.error('❌ Error requesting dev server:', error);
      // Continue with empty URLs
    }

    // Get chat state with error handling
    let isRunning = false;
    try {
      const chatStateResult = await chatState(app.info.id);
      isRunning = chatStateResult.state === "running";
    } catch (error) {
      console.error('❌ Error getting chat state:', error);
      // Default to not running
    }

    // Use the previewDomain from the database, or fall back to a generated domain
    const domain = app.info.previewDomain;

    console.log('🎉 Rendering app wrapper for:', app.info.id);

    return (
      <AppWrapper
        key={app.info.id}
        baseId={app.info.baseId}
        codeServerUrl={codeServerUrl}
        appName={app.info.name || 'Unnamed App'}
        initialMessages={uiMessages}
        consoleUrl={ephemeralUrl + "/__console"}
        repo={app.info.gitRepo}
        appId={app.info.id}
        repoId={app.info.gitRepo}
        domain={domain ?? undefined}
        running={isRunning}
      />
    );
  } catch (error) {
    console.error('❌ Error in app page:', error);
    return <ProjectNotFound />;
  }
}

function ProjectNotFound() {
  return (
    <div className="text-center my-16">
      <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
      <p className="text-gray-600 mb-4">
        This project doesn't exist or you don't have permission to access it.
      </p>
      <div className="flex justify-center mt-4">
        <Link className={buttonVariants()} href="/">
          Go back to home
        </Link>
      </div>
    </div>
  );
}
