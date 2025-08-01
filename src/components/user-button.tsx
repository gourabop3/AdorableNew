"use client";

import { useState, useEffect } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

export function UserButton() {
  const [userData, setUserData] = useState<UserData | null>(null);
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
    }
  };

  const handleUpgrade = () => {
    router.push('/billing');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Credits Display */}
      {userData && (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <ZapIcon className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{userData.credits}</span>
          <Badge variant={userData.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
            {userData.plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
        </div>
      )}

      {/* Custom User Button with Upgrade Option */}
      <div className="relative group">
        <StackUserButton />
        
        {/* Custom Dropdown */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            <button
              onClick={handleUpgrade}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <CrownIcon className="h-4 w-4" />
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}