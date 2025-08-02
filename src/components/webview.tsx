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
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">
                      {iframeLoading ? "Loading Preview" : "Starting Development Server"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Develop By Gourab
                </div>
              </div>
            </div>
          )
        }
        errorComponent={({ error }) => (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full border">
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">
                    No Preview Available
                  </span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Start chatting to generate your app
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Develop By Gourab
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
