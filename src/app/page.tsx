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
import { InteractiveDemo } from "@/components/interactive-demo";

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

  useEffect(() => {
    if (appCreated === 'true') {
      refetch();
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('app_created');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [appCreated, refetch]);

  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  const handleSubmit = async () => {
    const requestId = crypto.randomUUID();
    if (isLoading || checkingCredits) return;
    if (!prompt.trim()) return;
    setIsLoading(true);
    setCheckingCredits(true);
    try {
      if (billing && billing.credits < 1) {
        const params = new URLSearchParams();
        params.set('message', encodeURIComponent(prompt));
        params.set('template', framework);
        router.push(`/app/upgrade?${params.toString()}`);
        return;
      }
      router.push(`/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`);
    } catch (error) {
      router.push(`/app/new?message=${encodeURIComponent(prompt)}&template=${framework}`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setCheckingCredits(false);
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Image src={VibeLogo} alt="Vibe Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">Vibe</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Documentation
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center">
              <UserButtonWithBilling />
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Build AI Apps
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Instantly</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Generate, deploy, and manage full-stack applications with AI. 
              <span className="font-semibold text-gray-900"> No code required.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('app-generator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Building Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 text-lg font-semibold transition-all duration-200"
                onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>1 credit per app</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Instant deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No setup required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ...rest of the content remains unchanged... */}
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
