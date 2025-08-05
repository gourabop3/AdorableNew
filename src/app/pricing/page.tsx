"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VibeLogo from "@/vibe-logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Check, 
  Star, 
  Zap, 
  Users, 
  Shield, 
  Headphones, 
  Rocket,
  Crown,
  Sparkles,
  ArrowRight,
  ExternalLink
} from "lucide-react";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started with AI-powered development",
    features: [
      "5 app generations per month",
      "Basic AI templates",
      "Community support",
      "Standard response time",
      "Basic analytics",
      "1 team member"
    ],
    limitations: [
      "No custom domains",
      "No priority support",
      "No advanced AI features"
    ],
    popular: false,
    cta: "Get Started Free",
    href: "/",
    icon: Sparkles
  },
  {
    name: "Pro",
    price: { monthly: 29, yearly: 290 },
    description: "For developers and small teams building amazing apps",
    features: [
      "100 app generations per month",
      "Advanced AI templates",
      "Priority support",
      "Custom domains",
      "Advanced analytics",
      "Up to 5 team members",
      "Real-time collaboration",
      "API access",
      "Advanced AI features",
      "Export capabilities"
    ],
    limitations: [],
    popular: true,
    cta: "Start Pro Trial",
    href: "/billing",
    icon: Crown,
    savings: "Save 17%"
  },
  {
    name: "Enterprise",
    price: { monthly: 99, yearly: 990 },
    description: "For large teams and organizations with advanced needs",
    features: [
      "Unlimited app generations",
      "Custom AI models",
      "Dedicated support",
      "Custom integrations",
      "Advanced security",
      "Unlimited team members",
      "White-label options",
      "SLA guarantees",
      "Custom training",
      "On-premise deployment"
    ],
    limitations: [],
    popular: false,
    cta: "Contact Sales",
    href: "mailto:sales@vibe.dev",
    icon: Rocket
  }
];

const features = [
  {
    category: "AI Features",
    items: [
      { name: "Natural Language App Generation", free: true, pro: true, enterprise: true },
      { name: "Custom AI Templates", free: false, pro: true, enterprise: true },
      { name: "Advanced AI Models", free: false, pro: true, enterprise: true },
      { name: "Custom AI Training", free: false, pro: false, enterprise: true }
    ]
  },
  {
    category: "Collaboration",
    items: [
      { name: "Real-time Collaboration", free: false, pro: true, enterprise: true },
      { name: "Team Management", free: true, pro: true, enterprise: true },
      { name: "Version Control", free: true, pro: true, enterprise: true },
      { name: "White-label Options", free: false, pro: false, enterprise: true }
    ]
  },
  {
    category: "Support & Security",
    items: [
      { name: "Community Support", free: true, pro: true, enterprise: true },
      { name: "Priority Support", free: false, pro: true, enterprise: true },
      { name: "Dedicated Support", free: false, pro: false, enterprise: true },
      { name: "Advanced Security", free: false, pro: true, enterprise: true }
    ]
  },
  {
    category: "Deployment & Integration",
    items: [
      { name: "Vercel Deployment", free: true, pro: true, enterprise: true },
      { name: "Custom Domains", free: false, pro: true, enterprise: true },
      { name: "API Access", free: false, pro: true, enterprise: true },
      { name: "Custom Integrations", free: false, pro: false, enterprise: true }
    ]
  }
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src={VibeLogo} alt="Vibe Logo" width={32} height={32} />
              <span className="text-xl font-bold text-gray-900">Vibe</span>
            </Link>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
                Documentation
              </Link>
              <Link href="/pricing" className="text-blue-600 font-medium">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your development needs. Start free and scale as you grow.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <plan.icon className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-gray-500 ml-2">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {plan.savings && isYearly && (
                    <p className="text-sm text-green-600 mt-1">{plan.savings}</p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <li key={index} className="flex items-center text-gray-400">
                      <span className="w-5 h-5 mr-3 flex-shrink-0">×</span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Compare Features
          </h2>
          
          <div className="space-y-8">
            {features.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="text-xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-700">{item.name}</span>
                        <div className="flex space-x-8">
                          <span className={`w-6 text-center ${item.free ? 'text-green-500' : 'text-gray-300'}`}>
                            {item.free ? '✓' : '×'}
                          </span>
                          <span className={`w-6 text-center ${item.pro ? 'text-green-500' : 'text-gray-300'}`}>
                            {item.pro ? '✓' : '×'}
                          </span>
                          <span className={`w-6 text-center ${item.enterprise ? 'text-green-500' : 'text-gray-300'}`}>
                            {item.enterprise ? '✓' : '×'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I exceed my limits?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll receive a notification when you're close to your limit. You can upgrade your plan or wait for the next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, we'll refund your payment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can try our Pro plan free for 14 days. No credit card required to start.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Build Amazing Apps?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of developers building the future with AI-powered development.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Documentation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Image src={VibeLogo} alt="Vibe Logo" width={32} height={32} />
                <h3 className="text-xl font-bold text-gray-900">Vibe</h3>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered development platform for building amazing applications.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm">
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
                  <a href="https://github.com/vibe-dev" className="text-gray-600 hover:text-gray-900 transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@vibe.dev" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="mailto:sales@vibe.dev" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sales Inquiries
                  </a>
                </li>
                <li>
                  <a href="/status" className="text-gray-600 hover:text-gray-900 transition-colors">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-500 text-sm">
                © 2024 Vibe. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}