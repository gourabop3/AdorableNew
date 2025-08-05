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
  const [showCustomLoader, setShowCustomLoader] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Function to hide any Freestyle branding
  const hideFreestyleBranding = () => {
    try {
      // Get the iframe element
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentDocument) {
        const iframeDoc = iframe.contentDocument;
        
        // Hide any elements with Freestyle branding
        const brandingSelectors = [
          '[class*="freestyle"]',
          '[class*="Freestyle"]',
          '[id*="freestyle"]',
          '[id*="Freestyle"]',
          '[data-freestyle]',
          '[data-freestyle-branding]',
          '[data-freestyle-logo]',
          '[data-freestyle-watermark]',
          '.freestyle-branding',
          '.freestyle-logo',
          '.freestyle-watermark',
          '.freestyle-footer',
          '.freestyle-header',
          'img[src*="freestyle"]',
          'img[src*="Freestyle"]',
          'img[alt*="freestyle"]',
          'img[alt*="Freestyle"]'
        ];
        
        brandingSelectors.forEach(selector => {
          const elements = iframeDoc.querySelectorAll(selector);
          elements.forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        });
      }
    } catch (error) {
      // Cross-origin restrictions might prevent access
      console.log('Could not access iframe content due to CORS');
    }
  };

  // Hide custom loader when app is ready
  useEffect(() => {
    console.log('Loader state:', { iframeLoaded, devCommandRunning, appReady });
    
    if (iframeLoaded && !devCommandRunning) {
      // App is ready, hide the custom loader
      setTimeout(() => {
        console.log('Hiding custom loader - app ready');
        setShowCustomLoader(false);
        setAppReady(true);
      }, 1000);
    }
  }, [iframeLoaded, devCommandRunning, appReady]);

  // Hide loader immediately if iframe is already loaded (for existing apps)
  useEffect(() => {
    if (iframeLoaded && !devCommandRunning && !appReady) {
      console.log('Hiding custom loader - iframe already loaded');
      setShowCustomLoader(false);
      setAppReady(true);
    }
  }, [iframeLoaded, devCommandRunning, appReady]);

  // Additional effect to hide loader after a reasonable timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showCustomLoader) {
        console.log('Hiding custom loader due to timeout');
        setShowCustomLoader(false);
        setAppReady(true);
      }
    }, 15000); // Reduced to 15 second timeout as fallback

    return () => clearTimeout(timeout);
  }, [showCustomLoader]);

  // Hide loader quickly if iframe loads within 3 seconds (existing apps)
  useEffect(() => {
    if (iframeLoaded && !devCommandRunning) {
      const quickTimeout = setTimeout(() => {
        if (showCustomLoader) {
          console.log('Hiding custom loader - quick load (existing app)');
          setShowCustomLoader(false);
          setAppReady(true);
        }
      }, 3000);

      return () => clearTimeout(quickTimeout);
    }
  }, [iframeLoaded, devCommandRunning, showCustomLoader]);

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
        {/* Custom loader overlay - only show when creating new apps */}
        {showCustomLoader && devCommandRunning && (
          <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">Vibe</h2>
                  <p className="text-lg text-gray-600">Creating your app...</p>
                  <p className="text-sm text-gray-500">
                    {devCommandRunning ? "Building your application..." : "Setting up your development environment"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
            console.log('Iframe loaded');
            setIframeLoaded(true);
            // Try to hide Freestyle branding after iframe loads
            setTimeout(() => {
              hideFreestyleBranding();
            }, 1000);
          }}
            loadingComponent={({ iframeLoading, devCommandRunning: running }) => {
              // Update the dev command running state
              console.log('Dev command running:', running);
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
