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
import Image from "next/image";
import VibeLogo from "@/vibe-logo.svg";

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
  const [showOverlay, setShowOverlay] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [devCommandRunning, setDevCommandRunning] = useState(false);

  // Hide overlay when iframe is loaded and dev command is not running
  useEffect(() => {
    if (iframeLoaded && !devCommandRunning) {
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [iframeLoaded, devCommandRunning]);

  // Fallback: Hide overlay after 10 seconds to ensure app shows
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setShowOverlay(false);
    }, 10000);
    return () => clearTimeout(fallbackTimer);
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
      <div className="relative w-full h-full">
        <FreestyleDevServer
          ref={devServerRef}
          actions={{ requestDevServer }}
          repoId={props.repo}
          disableBranding={true}
          hideWatermark={true}
          onLoad={() => {
            setIframeLoaded(true);
          }}
          loadingComponent={({ iframeLoading, devCommandRunning: running }) => {
            // Update the dev command running state
            setDevCommandRunning(running);
            
            return !running ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-b from-[#FAFAF8] via-[#B9D6F8] to-[#D98DBA]">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={VibeLogo}
                      alt="Vibe Logo"
                      width={48}
                      height={48}
                      className="animate-pulse"
                    />
                    <h2 className="text-2xl font-bold text-gray-800">AdorableNew</h2>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-semibold text-gray-700">
                      Your app coming soon...
                    </p>
                    <p className="text-sm text-gray-600">
                      {iframeLoading ? "Loading JavaScript" : "Starting your development environment"}
                    </p>
                  </div>
                  <div className="loader"></div>
                </div>
              </div>
            ) : null;
          }}
        />
        
        {/* Overlay to hide Freestyle branding - always show until app is fully ready */}
        {showOverlay && (
          <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Image
                  src={VibeLogo}
                  alt="AdorableNew Logo"
                  width={64}
                  height={64}
                  className="animate-pulse"
                />
                <h1 className="text-3xl font-bold text-gray-800">AdorableNew</h1>
              </div>
              <p className="text-xl text-gray-600">AI-Powered Code Generation Platform</p>
              <p className="text-sm text-gray-500">
                {devCommandRunning 
                  ? "Building your app..." 
                  : iframeLoaded 
                    ? "Loading your app..." 
                    : "Your app will appear here once generated..."
                }
              </p>
              {devCommandRunning && (
                <div className="loader"></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
