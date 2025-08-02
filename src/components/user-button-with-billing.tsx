"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZapIcon, CrownIcon, UserIcon, LogOutIcon, LogInIcon, AlertCircle, SparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBilling } from "@/contexts/billing-context";

export function UserButtonWithBilling() {
  const { billing, isLoading, error, isAuthenticated } = useBilling();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUpgrade = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    router.push('/billing');
    setIsDropdownOpen(false);
  };

  const handleSignIn = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    router.push('/handler/sign-in');
    setIsDropdownOpen(false);
  };

  const handleSignOut = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.warn('Signout error:', error);
      window.location.reload(); // Force reload anyway
    }
  };

  // If not authenticated, show simple Stack UserButton
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <StackUserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={(e) => {
            e.preventDefault();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <UserIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            Profile
          </span>
        </Button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-2">
              {/* User Info */}
              {billing && (
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {billing.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </span>
                    <Badge variant={billing.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
                      {billing.plan === 'pro' ? (
                        <span className="flex items-center gap-1">
                          <SparklesIcon className="h-3 w-3" />
                          Pro
                        </span>
                      ) : 'Free'}
                    </Badge>
                  </div>
                  
                  {/* Credits Line */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                    <div className="flex items-center gap-2">
                      <ZapIcon className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {billing.plan === 'pro' ? `${billing.credits}/100` : `${billing.credits}/50`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !billing && (
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      <span className="text-sm text-orange-600 dark:text-orange-400">Offline</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={handleUpgrade}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <CrownIcon className="h-4 w-4" />
                  {billing?.plan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro'}
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <LogOutIcon className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}