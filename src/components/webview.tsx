"use client";

import { getCodespaceUrl } from "./webview-actions";
import "./loader.css";
import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { RefreshCwIcon, ExternalLinkIcon } from "lucide-react";
import { ShareButton } from "./share-button";

export default function WebView(props: {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
}) {
  const [codespaceUrl, setCodespaceUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCodespace = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = await getCodespaceUrl(props.repo);
        setCodespaceUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load codespace');
      } finally {
        setIsLoading(false);
      }
    };

    loadCodespace();
  }, [props.repo]);

  const handleRefresh = () => {
    setCodespaceUrl(null);
    setIsLoading(true);
    setError(null);
    loadCodespace();
  };

  const loadCodespace = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await getCodespaceUrl(props.repo);
      setCodespaceUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load codespace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden h-screen border-l transition-opacity duration-700 mt-[2px]">
      <div className="h-12 border-b border-gray-200 items-center flex px-2 bg-background sticky top-0 justify-end gap-2">
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCwIcon className={isLoading ? "animate-spin" : ""} />
        </Button>
        {codespaceUrl && (
          <Button
            variant={"ghost"}
            size={"icon"}
            onClick={() => window.open(codespaceUrl, '_blank')}
          >
            <ExternalLinkIcon />
          </Button>
        )}
        <ShareButton domain={props.domain} appId={props.appId} />
      </div>
      
      <div className="flex-1 relative">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div>
              <div className="text-center">
                Starting GitHub Codespace...
              </div>
              <div>
                <div className="loader"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500">
              <div className="text-lg font-semibold mb-2">Error</div>
              <div className="text-sm">{error}</div>
              <Button onClick={handleRefresh} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        )}
        
        {codespaceUrl && !isLoading && (
          <iframe
            src={codespaceUrl}
            className="w-full h-full border-0"
            title="GitHub Codespace"
            allow="camera; microphone; geolocation; encrypted-media"
          />
        )}
      </div>
    </div>
  );
}
