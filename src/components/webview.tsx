"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { useRef } from "react";
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
          )
        }
      />
    </div>
  );
}
