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
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [devCommandRunning, setDevCommandRunning] = useState(false);

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
      <div className="relative w-full h-full">
        <div className="w-full h-full" style={{ 
          // Hide any Freestyle branding that might appear
          '--hide-branding': 'true'
        }}>
          <FreestyleDevServer
            ref={devServerRef}
            actions={{ requestDevServer }}
            repoId={props.repo}
            disableBranding={true}
            hideWatermark={true}
            hideLogo={true}
            hideFooter={true}
            onLoad={() => {
              setIframeLoaded(true);
            }}
            loadingComponent={({ iframeLoading, devCommandRunning: running }) => {
              // Update the dev command running state
              setDevCommandRunning(running);
              
              return !running ? (
                <div className="flex items-center justify-center h-full bg-gradient-to-b from-[#FAFAF8] via-[#B9D6F8] to-[#D98DBA]">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="text-center space-y-2">
                      <p className="text-xl font-semibold text-gray-700">
                        🚀 Preparing your app...
                      </p>
                      <p className="text-sm text-gray-600">
                        {iframeLoading ? "Loading your application..." : "Setting up your development environment"}
                      </p>
                    </div>
                    <div className="loader"></div>
                  </div>
                </div>
              ) : null;
            }}
          />
        </div>
      </div>
    </div>
  );
}
