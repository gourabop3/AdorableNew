"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, CrownIcon, CreditCardIcon, ZapIcon, HomeIcon, SparklesIcon, ShieldIcon, ClockIcon } from "lucide-react";
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

export default function BillingPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your billing information...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing & Credits</h1>
          <p className="text-gray-600 text-lg">Manage your subscription and view your credit balance</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan & Credits Card */}
          <Card className="lg:col-span-1 shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CrownIcon className="h-6 w-6" />
                Current Plan
              </CardTitle>
              <CardDescription className="text-purple-100">
                Your current subscription and credit balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Plan</span>
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
                <span className="text-sm font-medium text-gray-700">Credits</span>
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
            </CardContent>
          </Card>

          {/* Upgrade Plan Card */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-6 w-6" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription className="text-blue-100">
                Get more credits and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Details */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">Pro Plan</h3>
                      <div className="text-right">
                        <div className="text-3xl font-bold">$29.99</div>
                        <div className="text-sm opacity-90">per month</div>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckIcon className="h-5 w-5 text-green-300" />
                        <span>100 credits per month</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="h-5 w-5 text-green-300" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="h-5 w-5 text-green-300" />
                        <span>Advanced AI features</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckIcon className="h-5 w-5 text-green-300" />
                        <span>Unlimited conversations</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  {userData.plan === 'free' ? (
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
                          </div>
                        )}
                      </SafeButton>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Secure payment powered by Stripe</p>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckIcon className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">Pro Plan Active</span>
                        </div>
                        <p className="text-sm text-green-700">
                          You're currently on the Pro plan with {userData.credits} credits available.
                        </p>
                      </div>
                      
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
                      
                      {subscription?.cancelAtPeriodEnd && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800 text-center">
                            Your subscription will end on {subscription.currentPeriodEnd && 
                              new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Credit Usage History */}
        <Card className="mt-8 shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
            <CardTitle>Credit Usage History</CardTitle>
            <CardDescription className="text-gray-200">
              Track your credit consumption and transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <ZapIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Credit usage history will be displayed here</p>
              <p className="text-gray-400 text-sm mt-2">Coming soon - detailed transaction history</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button onClick={handleGoHome} variant="outline" className="mx-2">
            <HomeIcon className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}