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

  // Show a simple test page first to see if the issue is with complex components
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-green-600">✅ App Loaded Successfully!</h1>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">{appName || 'Unnamed App'}</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>App ID:</strong> {appId}</p>
            <p><strong>Base ID:</strong> {baseId}</p>
            <p><strong>Repo:</strong> {repo}</p>
            <p><strong>Messages:</strong> {initialMessages.length}</p>
            <p><strong>Running:</strong> {running ? 'Yes' : 'No'}</p>
            <p><strong>Mobile:</strong> {isMobile ? 'Yes' : 'No'}</p>
          </div>
          <div className="mt-6 space-y-2">
            <button 
              onClick={() => {
                console.log('🔄 Reloading page...');
                window.location.reload();
              }} 
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                console.log('🏠 Going to home...');
                window.location.href = '/';
              }} 
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Go to Home
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          If you can see this, the AppWrapper is working. The issue might be with the Chat or WebView components.
        </p>
      </div>
    </div>
  );
}
