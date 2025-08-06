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

  return <main>Hello</main>;
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
