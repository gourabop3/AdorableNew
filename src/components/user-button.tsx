"use client";

import { useState, useEffect } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon, AlertTriangleIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

interface BillingResponse {
  user: UserData;
  subscription: any;
  databaseError?: boolean;
}

export function UserButton() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/billing');
      if (response.ok) {
        const data: BillingResponse = await response.json();
        setUserData(data.user);
        setDatabaseError(data.databaseError || false);
      } else {
        console.error('Failed to fetch billing data');
        setDatabaseError(true);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setDatabaseError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/billing');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Credits Display */}
      {!loading && userData && (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <ZapIcon className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{userData.credits}</span>
          <Badge variant={userData.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
            {userData.plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
          {databaseError && (
            <AlertTriangleIcon className="h-3 w-3 text-orange-500" title="Database connection issue" />
          )}
        </div>
      )}

      {/* Upgrade Button for Free Users */}
      {!loading && userData && userData.plan === 'free' && (
        <button
          onClick={handleUpgrade}
          className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
        >
          <CrownIcon className="h-3 w-3" />
          Upgrade
        </button>
      )}

      {/* Stack User Button */}
      <StackUserButton />
    </div>
  );
}