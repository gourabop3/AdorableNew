"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { RefreshCwIcon } from "lucide-react";
import { ShareButton } from "./share-button";

export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
}) {
  const [showFallback, setShowFallback] = useState(false);
  
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);

  // Show fallback message after 10 seconds if no preview loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden h-screen border-l transition-opacity duration-700 mt-[2px]">
      <div className="h-12 border-b border-gray-200 items-center flex px-2 bg-background sticky top-0 justify-end gap-2">
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => devServerRef.current?.refresh()}
        >
          <RefreshCwIcon />
        </Button>
        <ShareButton domain={props.domain} appId={props.appId} />
      </div>
      <FreestyleDevServer
        ref={devServerRef}
        actions={{ requestDevServer }}
        repoId={props.repo}
        loadingComponent={({ iframeLoading, devCommandRunning }) =>
          !devCommandRunning && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mb-4">
                  {iframeLoading ? "JavaScript Loading" : "Starting VM"}
                </div>
                <div className="mb-8">
                  <div className="loader"></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Develop By Gourab
                </div>
              </div>
            </div>
          )
        }
        errorComponent={({ error }) => (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4 text-lg font-medium">
                No Preview Available
              </div>
              <div className="mb-8 text-sm text-muted-foreground">
                Start chatting to generate your app
              </div>
              <div className="text-sm text-muted-foreground">
                Develop By Gourab
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
