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

  // Debug logging
  useEffect(() => {
    console.log('🔍 UserButtonWithBilling Debug:', {
      isAuthenticated,
      isLoading,
      error,
      billing: billing ? {
        credits: billing.credits,
        plan: billing.plan,
        hasStripeCustomerId: !!billing.stripeCustomerId
      } : null
    });
  }, [isAuthenticated, isLoading, error, billing]);

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
    console.log('🔐 User not authenticated, showing simple button');
    return (
      <div className="flex items-center gap-2">
        <StackUserButton />
      </div>
    );
  }

  console.log('✅ User authenticated, showing billing dropdown');

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
                          <CrownIcon className="h-3 w-3" />
                          Pro
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <SparklesIcon className="h-3 w-3" />
                          Free
                        </span>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Credits
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {billing.plan === 'pro' ? `${billing.credits}/100` : `${billing.credits}/50`}
                    </span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading billing info...
                </div>
              )}

              {/* Error State */}
              {error && !billing && (
                <div className="px-3 py-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {/* Billing/Upgrade Option */}
                <button
                  onClick={handleUpgrade}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2"
                >
                  <ZapIcon className="h-4 w-4" />
                  {billing?.plan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro'}
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2"
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