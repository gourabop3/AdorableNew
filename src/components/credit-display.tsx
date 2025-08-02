"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon, SparklesIcon } from "lucide-react";

interface CreditDisplayProps {
  credits: number;
  plan: "free" | "pro";
  className?: string;
  showPlan?: boolean;
}

export function CreditDisplay({ 
  credits, 
  plan, 
  className = "",
  showPlan = true 
}: CreditDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className={`shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <ZapIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Credits</span>
                {plan === 'pro' && (
                  <Badge variant="default" className="bg-purple-600 text-xs">
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{credits}</span>
                {showPlan && plan === 'free' && (
                  <span className="text-xs text-gray-500">/ 50 free</span>
                )}
              </div>
            </div>
          </div>
          
          {plan === 'pro' && (
            <div className="flex items-center gap-1 text-purple-600">
              <CrownIcon className="h-4 w-4" />
              <span className="text-xs font-medium">Unlimited</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}