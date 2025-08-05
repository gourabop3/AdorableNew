"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon, AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreditCheckProps {
  onProceed: () => void;
  onCancel: () => void;
}

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

export function CreditCheck({ onProceed, onCancel }: CreditCheckProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/billing');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/billing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load user data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onCancel} className="w-full">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasEnoughCredits = userData.credits >= 1; // 1 credit per app creation

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapIcon className="h-5 w-5" />
            Credit Check
          </CardTitle>
          <CardDescription>
            Creating an app requires 1 credit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Your Credits</span>
            <div className="flex items-center gap-2">
              <ZapIcon className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{userData.credits}</span>
              <Badge variant={userData.plan === 'pro' ? 'default' : 'secondary'}>
                {userData.plan === 'pro' ? 'Pro' : 'Free'}
              </Badge>
            </div>
          </div>

          {hasEnoughCredits ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <ZapIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Sufficient credits available</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={onProceed} className="flex-1">
                  Create App (1 credit)
                </Button>
                <Button onClick={onCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Insufficient credits</span>
              </div>
              <p className="text-sm text-gray-600">
                You need {1 - userData.credits} more credits to create an app.
              </p>
              <div className="space-y-2">
                <Button onClick={handleUpgrade} className="w-full">
                  <CrownIcon className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
                  Go Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}