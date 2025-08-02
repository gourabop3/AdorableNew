"use client";

import React, { useEffect, useState } from "react";
import Chat from "./chat";
import { TopBar } from "./topbar";
import { MessageCircle, Monitor } from "lucide-react";
import WebView from "./webview";
import { UIMessage } from "ai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppWrapper({
  appName,
  repo,
  initialMessages,
  appId,
  repoId,
  baseId,
  domain,
  running,
  codeServerUrl,
  consoleUrl,
}: {
  appName: string;
  repo: string;
  appId: string;
  respond?: boolean;
  initialMessages: UIMessage[];
  repoId: string;
  baseId: string;
  codeServerUrl: string;
  consoleUrl: string;
  domain?: string;
  running: boolean;
}) {
  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "preview">(
    "chat"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      console.log('📱 Mobile detection:', { isMobile: mobile, width: window.innerWidth });
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // or 'visible'
    };
  }, []);

  console.log('🎨 AppWrapper rendering:', {
    isMobile,
    mobileActiveTab,
    appName,
    appId,
    initialMessagesCount: initialMessages.length,
    running,
    hasError
  });

  // Error boundary - show fallback content if there's an error
  if (hasError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">App Loading Error</h1>
          <p className="text-gray-600 mb-4">
            There was an issue loading the app. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Simplified mobile layout to prevent blank screen
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col" style={{ height: "100dvh" }}>
        {/* Mobile content area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Chat tab */}
          <div
            className={`absolute inset-0 transition-transform duration-200 ${
              mobileActiveTab === "chat" ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{
              top: "env(safe-area-inset-top)",
              bottom: "60px",
            }}
          >
            <QueryClientProvider client={queryClient}>
              <Chat
                topBar={
                  <TopBar
                    appName={appName}
                    repoId={repoId}
                    consoleUrl={consoleUrl}
                    codeServerUrl={codeServerUrl}
                  />
                }
                appId={appId}
                initialMessages={initialMessages}
                key={appId}
                running={running}
              />
            </QueryClientProvider>
          </div>

          {/* Preview tab */}
          <div
            className={`absolute inset-0 transition-transform duration-200 ${
              mobileActiveTab === "preview" ? "translate-x-0" : "translate-x-full"
            }`}
            style={{
              top: "env(safe-area-inset-top)",
              bottom: "60px",
            }}
          >
            <div className="h-full overflow-hidden relative">
              <WebView
                repo={repo}
                baseId={baseId}
                appId={appId}
                domain={domain}
              />
            </div>
          </div>
        </div>

        {/* Mobile tab navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex border-t bg-background/95 backdrop-blur-sm h-[60px]">
          <button
            onClick={() => {
              setMobileActiveTab("chat");
              console.log('📱 Switched to chat tab');
            }}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
              mobileActiveTab === "chat"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle
              className={`h-6 w-6 mb-1 ${
                mobileActiveTab === "chat" ? "fill-current" : ""
              }`}
            />
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button
            onClick={() => {
              setMobileActiveTab("preview");
              console.log('📱 Switched to preview tab');
            }}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
              mobileActiveTab === "preview"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor
              className={`h-6 w-6 mb-1 ${
                mobileActiveTab === "preview" ? "fill-current" : ""
              }`}
            />
            <span className="text-xs font-medium">Preview</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex flex-col" style={{ height: "100dvh" }}>
      <div className="flex-1 overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_2fr]">
        <div className="h-full overflow-hidden flex flex-col">
          <QueryClientProvider client={queryClient}>
            <Chat
              topBar={
                <TopBar
                  appName={appName}
                  repoId={repoId}
                  consoleUrl={consoleUrl}
                  codeServerUrl={codeServerUrl}
                />
              }
              appId={appId}
              initialMessages={initialMessages}
              key={appId}
              running={running}
            />
          </QueryClientProvider>
        </div>

        <div className="overflow-auto">
          <div className="h-full overflow-hidden relative">
            <WebView
              repo={repo}
              baseId={baseId}
              appId={appId}
              domain={domain}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
