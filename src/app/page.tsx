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
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  ZapIcon, 
  CodeIcon, 
  GlobeIcon,
  CheckIcon,
  PlayIcon,
  GitBranchIcon,
  DatabaseIcon,
  PaletteIcon,
  ShieldIcon,
  UsersIcon,
  TrendingUpIcon,
  StarIcon,
  MessageSquareIcon,
  EyeIcon,
  SettingsIcon,
  RocketIcon
} from "lucide-react";
import { FloatingElements } from "@/components/floating-elements";
import { ProfessionalFooter } from "@/components/professional-footer";
import { FeaturesShowcase } from "@/components/features-showcase";
import { TestimonialsSection } from "@/components/testimonials-section";
import { StatsSection } from "@/components/stats-section";

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
    <main className="min-h-screen relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Floating Background Elements */}
      <FloatingElements />

      {/* Payment Success Banner */}
      {showPaymentSuccess && (
        <PaymentSuccessBanner
          credits={credits ? parseInt(credits) : 100}
          plan={plan || "pro"}
          onClose={() => setShowPaymentSuccess(false)}
          showHomeButton={false}
        />
      )}

      {/* Enhanced Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 group">
              <div className="relative">
                <Image src={VibeLogo} alt="Vibe Logo" width={36} height={36} className="group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Vibe</span>
              <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full">AI</span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group">
                Documentation
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <GitBranchIcon className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <UserButtonWithBilling />
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full">
                <SparklesIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Your superhuman full-stack engineer</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
              <span className="block">Idea to App</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent block">
                in Seconds
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your ideas into fully functional applications with AI. 
              <span className="font-semibold text-gray-900"> Live rendering, instant deployment, beautiful design.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              {/* Removed Start Building Free and Watch Demo buttons section as requested */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <ZapIcon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Instant Generation</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Live Preview</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <CodeIcon className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Full-Stack Code</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center">
                  <GlobeIcon className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">One-Click Deploy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced App Generator Section */}
      <div id="app-generator" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Describe Your Vision
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI transforms your ideas into production-ready applications with beautiful design and full functionality.
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl p-8">
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
              className="border-none bg-transparent shadow-none focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-300"
            >
              <PromptInputTextareaWithTypingAnimation />
              <PromptInputActions>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isLoading || checkingCredits || !prompt.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="hidden sm:inline">
                    {checkingCredits ? 'Checking Credits...' : 'Generate App ✨'}
                  </span>
                  <span className="sm:hidden">
                    {checkingCredits ? 'Checking...' : 'Generate ✨'}
                  </span>
                </Button>
              </PromptInputActions>
            </PromptInput>
          </div>
        </div>

        {/* Enhanced Templates Grid */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Start with a Template
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {PROJECT_TEMPLATES.map((template) => (
              <button
                key={template.title}
                className="w-full group"
                onClick={() => {
                  setPrompt(template.prompt);
                  document.getElementById('app-generator')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-white">
                  <div className="aspect-video relative rounded-xl overflow-hidden mb-4">
                    <Image
                      src={template.image}
                      alt={template.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-left group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <FeaturesShowcase />

      {/* Enhanced Demo Section */}
      <div id="demo-section" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See the Magic in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how our AI transforms your ideas into working applications with live rendering and instant deployment.
            </p>
          </div>
          <InteractiveDemo />
        </div>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      {/* Removed CTA section with 'Start Building Now' as requested */}

      {/* Professional Footer */}
      <ProfessionalFooter />
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
