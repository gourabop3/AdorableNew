"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import Image from "next/image";
import LogoSvg from "@/logo.svg";
import VibeLogo from "@/vibe-logo.svg";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "@/components/template-card";
import { PROJECT_TEMPLATES } from "@/lib/templates";
import { UserButtonWithBilling } from "@/components/user-button-with-billing";
import { UserApps } from "@/components/user-apps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { BillingProvider, useBilling } from "@/contexts/billing-context";
import { PaymentSuccessBanner } from "@/components/payment-success-banner";

const queryClient = new QueryClient();

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

function HomeContent() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { billing, refetch, isAuthenticated } = useBilling();

  // Check for payment success parameters
  const success = searchParams.get('success');
  const plan = searchParams.get('plan');
  const credits = searchParams.get('credits');
  const appCreated = searchParams.get('app_created');

  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (success && !showPaymentSuccess) {
      setShowPaymentSuccess(true);
    }
  }, [success, showPaymentSuccess]);

  // Refresh billing data when user returns from app creation
  useEffect(() => {
    if (appCreated === 'true') {
      refetch();
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('app_created');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [appCreated, refetch]);

  // Refresh billing data when window regains focus (user returns from app creation)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing billing data...');
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const handleSubmit = async () => {
    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();
    
    // Prevent multiple rapid submissions
    if (isLoading || checkingCredits) {
      console.log(`[${requestId}] Submission blocked - already processing`);
      return;
    }
    
    // Additional check to prevent empty submissions
    if (!prompt.trim()) {
      console.log(`[${requestId}] Submission blocked - empty prompt`);
      return;
    }
    
    console.log(`[${requestId}] Starting app creation process...`);
    if (isDevelopment) {
      console.log(`[${requestId}] Development mode detected - double execution possible`);
    }
    
    setIsLoading(true);
    setCheckingCredits(true);

    try {
      // Check if user has enough credits before proceeding
      if (billing && billing.credits < 1) {
        console.log(`[${requestId}] Insufficient credits, redirecting to upgrade`);
        // Redirect to upgrade page with current parameters
        const params = new URLSearchParams();
        params.set('message', encodeURIComponent(prompt));
        params.set('template', framework);
        router.push(`/app/upgrade?${params.toString()}`);
        return;
      }

      console.log(`[${requestId}] Proceeding with app creation...`);
      // Proceed with app creation
      router.push(
        `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
      );
    } catch (error) {
      console.error(`[${requestId}] Error checking credits:`, error);
      // Fallback to normal app creation
      router.push(
        `/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`
      );
    } finally {
      // Don't reset loading state immediately to prevent rapid re-submissions
      setTimeout(() => {
        console.log(`[${requestId}] Resetting loading states...`);
        setIsLoading(false);
        setCheckingCredits(false);
      }, 2000); // Increased from 1 second to 2 seconds for better protection
    }
  };

  return (
    <main className="min-h-screen p-4 relative bg-gradient-to-b from-[#FAFAF8] via-[#B9D6F8] to-[#D98DBA]">
          {/* Payment Success Banner */}
          {showPaymentSuccess && (
            <PaymentSuccessBanner
              credits={credits ? parseInt(credits) : 100}
              plan={plan || "pro"}
              onClose={() => setShowPaymentSuccess(false)}
              showHomeButton={false}
            />
          )}

          {/* Header */}
          <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center space-x-2">
                  <Image src={VibeLogo} alt="Vibe Logo" width={32} height={32} />
                  <span className="text-xl font-bold text-gray-900">Vibe</span>
                </Link>
                <nav className="flex space-x-8">
                  <Link href="/" className="text-blue-600 font-medium">
                    Home
                  </Link>
                  <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Documentation
                  </Link>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                </nav>
                <div className="flex items-center">
                  <UserButtonWithBilling />
                </div>
              </div>
            </div>
          </header>

          <div>
            <div className="w-full max-w-lg px-4 sm:px-0 mx-auto flex flex-col items-center mt-16 sm:mt-24 md:mt-32 col-start-1 col-end-1 row-start-1 row-end-1 z-10">
              <p className="text-neutral-600 text-center mb-6 text-3xl sm:text-4xl md:text-5xl font-bold">
                Build Something With Vibe
              </p>

              <div className="w-full relative my-5">
                <div className="relative w-full max-w-full overflow-hidden">
                  <div className="w-full bg-accent rounded-md relative z-10 border transition-colors">
                    <PromptInput
                      leftSlot={
                        <FrameworkSelector
                          value={framework}
                          onChange={setFramework}
                        />
                      }
                      isLoading={isLoading || checkingCredits}
                      value={prompt}
                      onValueChange={setPrompt}
                      onSubmit={handleSubmit}
                      className="relative z-10 border-none bg-transparent shadow-none focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-200 transition-all duration-200 ease-in-out "
                    >
                      <PromptInputTextareaWithTypingAnimation />
                      <PromptInputActions>
                        <Button
                          variant={"ghost"}
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isLoading || checkingCredits || !prompt.trim()}
                          className="h-7 text-xs"
                        >
                          <span className="hidden sm:inline">
                            {checkingCredits ? 'Checking Credits...' : 'Start Creating ⏎'}
                          </span>
                          <span className="sm:hidden">
                            {checkingCredits ? 'Checking...' : 'Create ⏎'}
                          </span>
                        </Button>
                      </PromptInputActions>
                    </PromptInput>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 mt-12 gap-6">
                {PROJECT_TEMPLATES.map((template) => (
                  <button
                    key={template.title}
                    className="w-full"
                    onClick={() => {
                      setPrompt(template.prompt);
                    }}
                  >
                    <TemplateCard
                      title={template.title}
                      imageUrl={template.image}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t py-8 mx-0 sm:-mx-4">
            <UserApps />
          </div>
          
          {/* Professional Footer */}
          <footer className="mt-16 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Image
                      src={VibeLogo}
                      alt="Vibe Logo"
                      width={32}
                      height={32}
                    />
                    <h3 className="text-xl font-bold text-gray-900">Vibe</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    AI-powered development platform that helps you build amazing applications faster than ever before.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Documentation
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Pricing
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://github.com/vibe-dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="GitHub"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/vibe.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://twitter.com/vibe_dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      aria-label="Twitter"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Stay updated with our latest features and announcements.
                  </p>
                </div>
              </div>
              
              {/* Bottom Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <p className="text-gray-500 text-sm">
                    © 2024 Vibe. All rights reserved.
                  </p>
                  <div className="flex space-x-6 text-sm">
                    <a href="https://vibe.dev/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
                      Privacy Policy
                    </a>
                    <a href="https://vibe.dev/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </main>
  );
}



export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <BillingProvider>
        <HomeContent />
      </BillingProvider>
    </QueryClientProvider>
  );
}
