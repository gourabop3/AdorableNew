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
          {/* App Generator Section */}
          <div id="app-generator" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Describe Your App
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tell us what you want to build, and our AI will create it for you in seconds.
              </p>
            </div>

            <div className="w-full relative">
              <div className="relative w-full max-w-full overflow-hidden">
                <div className="w-full bg-white rounded-xl relative z-10 border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl">
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
                    className="relative z-10 border-none bg-transparent shadow-none focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200"
                  >
                    <PromptInputTextareaWithTypingAnimation />
                    <PromptInputActions>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isLoading || checkingCredits || !prompt.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold transition-all duration-200"
                      >
                        <span className="hidden sm:inline">
                          {checkingCredits ? 'Checking Credits...' : 'Create App ⏎'}
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

            {/* Template Gallery */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Popular Templates
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
                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                      <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                        <Image
                          src={template.image}
                          alt={template.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-200"
                        />
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
          {/* Features Section */}
          <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Everything You Need to Build
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  From simple landing pages to complex full-stack applications, our AI handles it all.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
                  <p className="text-gray-600">Generate complete applications in seconds, not hours. Our AI works at incredible speed.</p>
                </div>

                {/* Feature 2 */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Production Ready</h3>
                  <p className="text-gray-600">Every app is built with best practices, modern frameworks, and ready for deployment.</p>
                </div>

                {/* Feature 3 */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Reliable</h3>
                  <p className="text-gray-600">Built-in security, authentication, and best practices ensure your apps are safe and scalable.</p>
                </div>

                {/* Feature 4 */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Customizable</h3>
                  <p className="text-gray-600">Full control over your code. Edit, customize, and extend your applications however you want.</p>
                </div>

                {/* Feature 5 */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics & Insights</h3>
                  <p className="text-gray-600">Track performance, monitor usage, and get insights to optimize your applications.</p>
                </div>

                {/* Feature 6 */}
                <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
                  <p className="text-gray-600">Invite team members, share projects, and collaborate seamlessly on your applications.</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Apps Section */}
          <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Your Applications
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Manage and deploy all your AI-generated applications from one place.
                </p>
              </div>
              <UserApps />
            </div>
          </div>

          {/* Interactive Demo Section */}
          <div id="demo-section" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  See It In Action
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Watch how our AI transforms your ideas into working applications in real-time.
                </p>
              </div>
              <InteractiveDemo />
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Loved by Developers
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Join thousands of developers who are building faster with Vibe.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Testimonial 1 */}
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      S
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Sarah Chen</h4>
                      <p className="text-sm text-gray-600">Full-Stack Developer</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "Vibe has completely transformed how I build applications. What used to take days now takes minutes. The quality of the generated code is incredible."
                  </p>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      M
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Mike Rodriguez</h4>
                      <p className="text-sm text-gray-600">Startup Founder</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "As a non-technical founder, Vibe has been a game-changer. I can now build and iterate on my ideas without waiting for developers."
                  </p>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-gray-50 rounded-xl p-8 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      A
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-900">Alex Thompson</h4>
                      <p className="text-sm text-gray-600">Product Manager</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "The speed and quality of Vibe's AI-generated applications is unmatched. It's like having a senior developer on your team 24/7."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-600">
                  Everything you need to know about building with Vibe.
                </p>
              </div>

              <div className="space-y-6">
                {/* FAQ Item 1 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How much does it cost to build an app?
                  </h3>
                  <p className="text-gray-600">
                    Each app generation costs just 1 credit. Free users get 5 credits per month, while Pro users get 100 credits per month.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    What frameworks do you support?
                  </h3>
                  <p className="text-gray-600">
                    We support Next.js, React with Vite, and Expo for mobile apps. Each framework is optimized for performance and best practices.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Can I customize the generated code?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! You have full access to the source code and can modify, extend, or customize it however you want.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    How long does it take to generate an app?
                  </h3>
                  <p className="text-gray-600">
                    Most applications are generated in 30-60 seconds. Complex applications may take up to 2-3 minutes.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Is my code secure and private?
                  </h3>
                  <p className="text-gray-600">
                    Yes! Your code is private and secure. We use enterprise-grade security and never share your applications with others.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Professional Footer */}
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

                {/* Product */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Product</h4>
                  <ul className="space-y-3 text-sm">
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
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        API Reference
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Status
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Support */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Community
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Contact Support
                      </a>
                    </li>
                  </ul>
                </div>
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
