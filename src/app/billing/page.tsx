"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import VibeLogo from "@/vibe-logo.svg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckIcon, 
  CrownIcon, 
  CreditCardIcon, 
  ZapIcon, 
  HomeIcon, 
  SparklesIcon, 
  ShieldIcon, 
  ClockIcon,
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
  StarIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  AlertCircleIcon,
  InfoIcon,
  DownloadIcon,
  RefreshCwIcon,
  SettingsIcon,
  BarChart3Icon,
  ActivityIcon,
  DollarSignIcon,
  GiftIcon
} from "lucide-react";
import { toast } from "sonner";
import { redirectToCheckout } from "@/lib/stripe-client";
import { SafeButton } from "@/components/safe-button";

interface UserData {
  id: string;
  email: string;
  name: string;
  credits: number;
  plan: "free" | "pro";
  stripeCustomerId?: string;
}

interface SubscriptionData {
  id: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

interface UsageData {
  totalUsed: number;
  totalAvailable: number;
  usagePercentage: number;
  monthlyUsage: Array<{
    month: string;
    used: number;
    available: number;
  }>;
}

const planFeatures = {
  free: [
    "5 app generations per month",
    "Basic AI templates",
    "Community support",
    "Standard response time",
    "Basic analytics",
    "1 team member"
  ],
  pro: [
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
  ]
};

const usageHistory = [
  { date: "2024-01-15", action: "App Generation", credits: -1, type: "usage" },
  { date: "2024-01-14", action: "Pro Plan Upgrade", credits: 100, type: "purchase" },
  { date: "2024-01-13", action: "App Generation", credits: -1, type: "usage" },
  { date: "2024-01-12", action: "App Generation", credits: -1, type: "usage" },
  { date: "2024-01-11", action: "Welcome Bonus", credits: 5, type: "bonus" },
];

export default function BillingPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchUserData();
    
    // Handle success/cancel from Stripe checkout
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      setShowSuccessModal(true);
      toast.success("🎉 Payment successful! Your Pro plan is now active.");
      fetchUserData(); // Refresh data
    } else if (canceled) {
      toast.error("Payment was canceled.");
    }
  }, [searchParams]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/billing');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setSubscription(data.subscription);
        
        // Mock usage data - replace with actual API call
        setUsageData({
          totalUsed: 15,
          totalAvailable: userData?.plan === 'pro' ? 100 : 5,
          usagePercentage: 75,
          monthlyUsage: [
            { month: "Jan", used: 15, available: 100 },
            { month: "Dec", used: 12, available: 100 },
            { month: "Nov", used: 18, available: 100 },
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setUpgrading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'pro' }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        
        // Use our robust Stripe client
        const result = await redirectToCheckout(sessionId);
        
        if (!result.success) {
          toast.error(result.error || 'Failed to redirect to payment page');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start upgrade process');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!subscription) return;
    
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      if (response.ok) {
        toast.success('Subscription will be canceled at the end of the current period');
        fetchUserData(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <ShieldIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">Please log in to view your billing information.</p>
                <SafeButton onClick={handleGoHome} className="w-full">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Go Home
                </SafeButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
              <p className="text-xl text-gray-600">Manage your plan, credits, and billing information</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="outline" size="sm">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Billing Settings
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Current Plan</p>
                    <p className="text-2xl font-bold">{userData.plan === 'pro' ? 'Pro' : 'Free'}</p>
                  </div>
                  <CrownIcon className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Credits Available</p>
                    <p className="text-2xl font-bold">{userData.credits}</p>
                  </div>
                  <ZapIcon className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Usage This Month</p>
                    <p className="text-2xl font-bold">{usageData?.totalUsed || 0}</p>
                  </div>
                  <ActivityIcon className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Next Billing</p>
                    <p className="text-lg font-bold">
                      {subscription?.currentPeriodEnd 
                        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your Pro plan is now active. You have {userData.credits} credits available.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={handleGoHome} className="w-full">
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Go to Homepage
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full"
                    >
                      Stay on Billing Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Plan Card */}
              <Card className="lg:col-span-1 shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CrownIcon className="h-6 w-6" />
                    Current Plan
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Your subscription details and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Plan Type</span>
                    <Badge variant={userData.plan === 'pro' ? 'default' : 'secondary'} className="text-sm">
                      {userData.plan === 'pro' ? (
                        <span className="flex items-center gap-1">
                          <SparklesIcon className="h-3 w-3" />
                          Pro
                        </span>
                      ) : 'Free'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <span className="text-sm font-medium text-gray-700">Credits Balance</span>
                    <div className="flex items-center gap-2">
                      <ZapIcon className="h-5 w-5 text-yellow-500" />
                      <span className="font-bold text-lg">{userData.credits}</span>
                    </div>
                  </div>

                  {subscription && (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Status</span>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                          {subscription.status}
                        </Badge>
                      </div>
                      
                      {subscription.currentPeriodEnd && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Next billing</span>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">Plan Features</h4>
                    <ul className="space-y-2">
                      {(userData.plan === 'pro' ? planFeatures.pro : planFeatures.free).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Plan Card */}
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCardIcon className="h-6 w-6" />
                    {userData.plan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    {userData.plan === 'free' 
                      ? 'Get more credits and advanced features' 
                      : 'Manage your current subscription'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {userData.plan === 'free' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Plan Details */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-xl">Pro Plan</h3>
                            <div className="text-right">
                              <div className="text-3xl font-bold">$29</div>
                              <div className="text-sm opacity-90">per month</div>
                            </div>
                          </div>
                          <ul className="space-y-3">
                            {planFeatures.pro.slice(0, 6).map((feature, index) => (
                              <li key={index} className="flex items-center gap-3">
                                <CheckIcon className="h-5 w-5 text-green-300" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <GiftIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-800">Special Offer</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            Save 17% with annual billing - only $290/year
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <SafeButton 
                            onClick={handleUpgrade} 
                            disabled={upgrading}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            size="lg"
                          >
                            {upgrading ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Processing...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CreditCardIcon className="h-5 w-5" />
                                Upgrade to Pro
                                <ArrowRightIcon className="h-4 w-4" />
                              </div>
                            )}
                          </SafeButton>
                          
                          <div className="text-center space-y-3">
                            <p className="text-sm text-gray-500">Secure payment powered by Stripe</p>
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-8 h-5 bg-gray-200 rounded"></div>
                              <div className="w-8 h-5 bg-gray-200 rounded"></div>
                              <div className="w-8 h-5 bg-gray-200 rounded"></div>
                            </div>
                            <p className="text-xs text-gray-400">
                              30-day money-back guarantee • Cancel anytime
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Why Upgrade?</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                              <StarIcon className="h-4 w-4 text-yellow-500" />
                              Priority support and faster response times
                            </li>
                            <li className="flex items-center gap-2">
                              <TrendingUpIcon className="h-4 w-4 text-green-500" />
                              20x more credits for your projects
                            </li>
                            <li className="flex items-center gap-2">
                              <UsersIcon className="h-4 w-4 text-blue-500" />
                              Collaborate with your team
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckIcon className="h-6 w-6 text-green-600" />
                          <span className="font-semibold text-green-800 text-lg">Pro Plan Active</span>
                        </div>
                        <p className="text-green-700 mb-4">
                          You're currently on the Pro plan with {userData.credits} credits available.
                          Enjoy all the advanced features and priority support.
                        </p>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            <ShieldIcon className="h-3 w-3 mr-1" />
                            Priority Support
                          </Badge>
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            <ZapIcon className="h-3 w-3 mr-1" />
                            100 Credits/Month
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SafeButton 
                          onClick={handleCancelSubscription}
                          variant="outline"
                          className="w-full h-12"
                          disabled={subscription?.cancelAtPeriodEnd}
                        >
                          {subscription?.cancelAtPeriodEnd 
                            ? 'Cancellation Scheduled' 
                            : 'Cancel Subscription'
                          }
                        </SafeButton>
                        
                        <Button variant="outline" className="w-full h-12">
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          Manage Billing
                        </Button>
                      </div>
                      
                      {subscription?.cancelAtPeriodEnd && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                            <span className="font-semibold text-yellow-800">Cancellation Scheduled</span>
                          </div>
                          <p className="text-sm text-yellow-700">
                            Your subscription will end on {subscription.currentPeriodEnd && 
                              new Date(subscription.currentPeriodEnd).toLocaleDateString()}. 
                            You can reactivate anytime before this date.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage & Analytics Tab */}
          <TabsContent value="usage" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Usage Overview */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3Icon className="h-5 w-5" />
                    Usage Overview
                  </CardTitle>
                  <CardDescription>
                    Your credit usage and consumption patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Credits Used This Month</span>
                      <span className="text-lg font-bold text-gray-900">{usageData?.totalUsed || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${usageData?.usagePercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>0</span>
                      <span>{usageData?.totalAvailable || 0} credits</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{usageData?.totalUsed || 0}</div>
                      <div className="text-sm text-blue-600">Used</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userData.credits}</div>
                      <div className="text-sm text-green-600">Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Usage Chart */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Monthly Usage
                  </CardTitle>
                  <CardDescription>
                    Credit consumption over the last 3 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageData?.monthlyUsage.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{month.month}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{month.used} used</span>
                          <span className="text-sm text-gray-500">/ {month.available}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage History */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recent credit transactions and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'usage' ? 'bg-red-100' : 
                          item.type === 'purchase' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {item.type === 'usage' ? (
                            <ZapIcon className="w-5 h-5 text-red-600" />
                          ) : item.type === 'purchase' ? (
                            <CreditCardIcon className="w-5 h-5 text-green-600" />
                          ) : (
                            <GiftIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.action}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        item.credits > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.credits > 0 ? '+' : ''}{item.credits} credits
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-8">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSignIcon className="h-5 w-5" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  Your past invoices and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CreditCardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Billing history will be displayed here</p>
                  <p className="text-gray-400 text-sm mt-2">Coming soon - detailed invoice history</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Billing Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your billing preferences and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download Invoices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Refresh Billing Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <InfoIcon className="h-5 w-5" />
                    Billing Information
                  </CardTitle>
                  <CardDescription>
                    Your account and billing details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{userData.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Customer ID</label>
                    <p className="text-gray-900">{userData.stripeCustomerId || 'Not available'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Created</label>
                    <p className="text-gray-900">January 2024</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Button onClick={handleGoHome} variant="outline" className="mx-2">
            <HomeIcon className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
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