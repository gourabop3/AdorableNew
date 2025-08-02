"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CrownIcon, 
  ZapIcon, 
  SparklesIcon, 
  CheckIcon, 
  ArrowRightIcon,
  HomeIcon,
  CreditCardIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradePromptProps {
  currentCredits: number;
  requiredCredits: number;
  onUpgrade: () => void;
  onGoHome: () => void;
  showHomeButton?: boolean;
}

export function UpgradePrompt({ 
  currentCredits, 
  requiredCredits, 
  onUpgrade, 
  onGoHome,
  showHomeButton = true 
}: UpgradePromptProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    onUpgrade();
  };

  const handleGoHome = () => {
    onGoHome();
  };

  const missingCredits = requiredCredits - currentCredits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CrownIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trial Credits Expired
          </h1>
          <p className="text-lg text-gray-600">
            You've used all your free trial credits. Upgrade to Pro to continue creating amazing apps!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Status */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="h-6 w-6" />
                Current Status
              </CardTitle>
              <CardDescription className="text-red-100">
                Your trial credits have been used
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-medium text-gray-700">Available Credits</span>
                  <div className="flex items-center gap-2">
                    <ZapIcon className="h-4 w-4 text-red-500" />
                    <span className="font-bold text-red-600">{currentCredits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Credits Needed</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{requiredCredits}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-gray-700">Missing Credits</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yellow-600">{missingCredits}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Plan */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-6 w-6" />
                Upgrade to Pro
              </CardTitle>
              <CardDescription className="text-purple-100">
                Get unlimited credits and advanced features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
                      <span>Unlimited app creation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckIcon className="h-5 w-5 text-green-300" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckIcon className="h-5 w-5 text-green-300" />
                      <span>Advanced AI features</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleUpgrade} 
                    disabled={isUpgrading}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isUpgrading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5" />
                        Upgrade Now
                        <ArrowRightIcon className="h-4 w-4" />
                      </div>
                    )}
                  </Button>

                  {showHomeButton && (
                    <Button 
                      onClick={handleGoHome} 
                      variant="outline" 
                      className="w-full h-12"
                    >
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Go to Homepage
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Secure payment powered by Stripe</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-8 shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle>Why Upgrade?</CardTitle>
            <CardDescription className="text-blue-100">
              Discover the benefits of the Pro plan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ZapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">More Credits</h3>
                <p className="text-sm text-gray-600">
                  Get 100 credits per month to create unlimited apps
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Advanced Features</h3>
                <p className="text-sm text-gray-600">
                  Access to premium AI models and advanced tools
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CrownIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Priority Support</h3>
                <p className="text-sm text-gray-600">
                  Get faster responses and dedicated support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}