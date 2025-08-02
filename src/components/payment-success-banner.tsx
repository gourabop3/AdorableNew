"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, SparklesIcon, ZapIcon, XIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentSuccessBannerProps {
  credits?: number;
  plan?: string;
  onClose?: () => void;
  showHomeButton?: boolean;
}

export function PaymentSuccessBanner({ 
  credits = 100, 
  plan = "pro", 
  onClose,
  showHomeButton = true 
}: PaymentSuccessBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4">
      <Card className="shadow-2xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Payment Successful!</h3>
                <p className="text-sm text-gray-600">Your {plan} plan is now active</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Plan</span>
              </div>
              <Badge variant="default" className="bg-purple-600">
                <SparklesIcon className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <ZapIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Credits Available</span>
              </div>
              <span className="font-bold text-lg text-yellow-600">{credits}</span>
            </div>

            {showHomeButton && (
              <Button 
                onClick={handleGoHome} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Start Using Your Credits
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}