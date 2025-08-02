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
          className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-white/10 backdrop-blur-sm"
        >
          <UserIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            Profile
          </span>
        </Button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
            <div className="p-4">
              {/* User Info */}
              {billing && (
                <div className="px-3 py-3 border-b border-white/10 mb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">
                      {billing.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    </span>
                    <Badge variant={billing.plan === 'pro' ? 'default' : 'secondary'} className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      {billing.plan === 'pro' ? (
                        <span className="flex items-center gap-1">
                          <SparklesIcon className="h-3 w-3" />
                          Pro
                        </span>
                      ) : 'Free'}
                    </Badge>
                  </div>
                  
                  {/* Credits Display with Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/80">Credits</span>
                      <div className="flex items-center gap-2">
                        <ZapIcon className="h-3 w-3 text-yellow-400" />
                        <span className="text-sm font-medium text-white">
                          {billing.plan === 'pro' ? `${billing.credits}/100` : `${billing.credits}/50`}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          billing.plan === 'pro' 
                            ? billing.credits > 80 
                              ? 'bg-red-500' 
                              : billing.credits > 50 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            : billing.credits > 40 
                              ? 'bg-red-500' 
                              : billing.credits > 25 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${billing.plan === 'pro' ? (billing.credits / 100) * 100 : (billing.credits / 50) * 100}%` 
                        }}
                      ></div>
                    </div>
                    
                    {/* Usage Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">
                        {billing.plan === 'pro' 
                          ? `${100 - billing.credits} credits remaining`
                          : `${50 - billing.credits} credits remaining`
                        }
                      </span>
                      <span className="text-white/60">
                        {billing.plan === 'pro' 
                          ? `${Math.round((billing.credits / 100) * 100)}% used`
                          : `${Math.round((billing.credits / 50) * 100)}% used`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="px-3 py-3 border-b border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80">Credits</span>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span className="text-sm text-white/60">Loading...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !billing && (
                <div className="px-3 py-3 border-b border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80">Credits</span>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-orange-400" />
                      <span className="text-sm text-orange-400">Offline</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                <button
                  onClick={handleUpgrade}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors"
                >
                  <CrownIcon className="h-4 w-4" />
                  {billing?.plan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro'}
                </button>
                
                <div className="border-t border-white/10 my-1"></div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors"
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