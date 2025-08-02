"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon, UserIcon, LogOutIcon, LogInIcon, AlertCircle } from "lucide-react";
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

  const handleUpgrade = () => {
    router.push('/billing');
    setIsDropdownOpen(false);
  };

  const handleSignIn = () => {
    router.push('/handler/sign-in');
    setIsDropdownOpen(false);
  };

  const handleSignOut = async () => {
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
    <div className="flex items-center gap-2">
      {/* Credits Display */}
      {billing && (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <ZapIcon className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{billing.credits}</span>
          <Badge variant={billing.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
            {billing.plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
          {error && (
            <AlertCircle className="h-3 w-3 text-orange-500" title={error} />
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}

      {/* Error State - Still functional */}
      {error && !billing && (
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-800 rounded-full">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <span className="text-sm text-orange-600 dark:text-orange-400">Offline</span>
        </div>
      )}

      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UserIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile
          </span>
        </button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleUpgrade}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <CrownIcon className="h-4 w-4" />
                {billing?.plan === 'pro' ? 'Manage Plan' : 'Upgrade to Pro'}
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <LogOutIcon className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}