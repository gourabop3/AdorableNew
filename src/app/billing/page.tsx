"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, CrownIcon, CreditCardIcon, ZapIcon } from "lucide-react";
import { toast } from "sonner";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchUserData();
    
    // Handle success/cancel from Stripe checkout
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      toast.success("Payment successful! Your Pro plan is now active.");
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

  const handleUpgrade = async () => {
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
        // Redirect to Stripe Checkout
        const stripe = await import('@stripe/stripe-js');
        const stripeInstance = await stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        await stripeInstance?.redirectToCheckout({ sessionId });
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

  const handleCancelSubscription = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to view your billing information.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Credits</h1>
          <p className="text-gray-600">Manage your subscription and view your credit balance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Plan & Credits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CrownIcon className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>
                Your current subscription and credit balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Plan</span>
                <Badge variant={userData.plan === 'pro' ? 'default' : 'secondary'}>
                  {userData.plan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Credits</span>
                <div className="flex items-center gap-2">
                  <ZapIcon className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{userData.credits}</span>
                </div>
              </div>

              {subscription && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  {subscription.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Next billing</span>
                      <span className="text-sm text-gray-600">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription>
                Get more credits and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Pro Plan - $29.99/month</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    100 credits per month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4" />
                    Advanced features
                  </li>
                </ul>
              </div>

              {userData.plan === 'free' ? (
                <Button 
                  onClick={handleUpgrade} 
                  disabled={upgrading}
                  className="w-full"
                  size="lg"
                >
                  {upgrading ? 'Processing...' : 'Upgrade to Pro'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    onClick={handleCancelSubscription}
                    variant="outline"
                    className="w-full"
                    disabled={subscription?.cancelAtPeriodEnd}
                  >
                    {subscription?.cancelAtPeriodEnd 
                      ? 'Cancellation Scheduled' 
                      : 'Cancel Subscription'
                    }
                  </Button>
                  {subscription?.cancelAtPeriodEnd && (
                    <p className="text-xs text-gray-500 text-center">
                      Your subscription will end on {subscription.currentPeriodEnd && 
                        new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Credit Usage */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Credit Usage</CardTitle>
            <CardDescription>
              Track your credit consumption and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ZapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Credit usage history will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}