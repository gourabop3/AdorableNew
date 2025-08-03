"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { FrameworkSelector } from "@/components/framework-selector";
import Image from "next/image";
import LogoSvg from "@/logo.svg";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExampleButton } from "@/components/ExampleButton";
import { UserButtonWithBilling } from "@/components/user-button-with-billing";
import { UserApps } from "@/components/user-apps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromptInputTextareaWithTypingAnimation } from "@/components/prompt-input";
import { BillingProvider } from "@/contexts/billing-context";
import { PaymentSuccessBanner } from "@/components/payment-success-banner";

const queryClient = new QueryClient();

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState("nextjs");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for payment success parameters
  const success = searchParams.get('success');
  const plan = searchParams.get('plan');
  const credits = searchParams.get('credits');

  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
  if (success && !showPaymentSuccess) {
    setShowPaymentSuccess(true);
  }
}, [success, showPaymentSuccess]);
  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/billing');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
      if (userData && userData.credits < 5) {
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
    <QueryClientProvider client={queryClient}>
      <BillingProvider>
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

          <div className="flex w-full justify-between items-center">
            <h1 className="text-lg font-bold flex-1 sm:w-80">
              <a href="https://www.vibe.dev">vibe.dev</a>
            </h1>
            <Image
              className="dark:invert mx-2"
              src={LogoSvg}
              alt="Vibe Logo"
              width={36}
              height={36}
            />
            <div className="flex items-center gap-2 flex-1 sm:w-80 justify-end">
              <UserButtonWithBilling />
            </div>
          </div>

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
              <Examples setPrompt={setPrompt} />
              <div className="mt-8 mb-16">
                <a
                  href="https://vibe.dev"
                  className="border rounded-md px-4 py-2 mt-4 text-sm font-semibold transition-colors duration-200 ease-in-out cursor-pointer w-full max-w-72 text-center block"
                >
                  <span className="block font-bold">
                    By <span className="underline">vibe.dev</span>
                  </span>
                  <span className="text-xs">
                    AI-powered development platform.
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t py-8 mx-0 sm:-mx-4">
            <UserApps />
          </div>
        </main>
      </BillingProvider>
    </QueryClientProvider>
  );
}

function Examples({ setPrompt }: { setPrompt: (text: string) => void }) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap justify-center gap-2 px-2">
        <ExampleButton
          text="Dog Food Marketplace"
          promptText="Build a dog food marketplace where users can browse and purchase premium dog food."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Personal Website"
          promptText="Create a personal website with portfolio, blog, and contact sections."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
        <ExampleButton
          text="Burrito B2B SaaS"
          promptText="Build a B2B SaaS for burrito shops to manage inventory, orders, and delivery logistics."
          onClick={(text) => {
            console.log("Example clicked:", text);
            setPrompt(text);
          }}
        />
      </div>
    </div>
  );
}
