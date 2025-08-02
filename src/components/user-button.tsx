"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon, UserIcon, LogOutIcon, LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

export function UserButton() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

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

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching user billing data...');
      
      const response = await fetch('/api/user/billing');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User data received:', data);
        console.log('✅ User object:', data.user);
        console.log('✅ User ID:', data.user?.id);
        console.log('✅ User credits:', data.user?.credits);
        
        if (data.user && data.user.id) {
          setUserData(data.user);
          setIsAuthenticated(true);
          console.log('✅ Setting authenticated to true');
        } else {
          console.log('❌ User data is missing or invalid');
          setUserData(null);
          setIsAuthenticated(false);
        }
      } else if (response.status === 401) {
        console.log('🔐 User not authenticated (401) - expected after signout');
        setUserData(null);
        setIsAuthenticated(false);
      } else {
        const errorData = await response.json();
        console.log('⚠️ API error (non-critical):', errorData);
        setUserData(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('⚠️ Network error fetching user data (non-critical):', error);
      setUserData(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading finished. isAuthenticated:', isAuthenticated);
    }
  };

  const handleUpgrade = () => {
    router.push('/billing');
    setIsDropdownOpen(false);
  };

  const handleSignIn = () => {
    console.log('🔐 Redirecting to sign in...');
    router.push('/handler/sign-in');
    setIsDropdownOpen(false);
  };

  const handleSignOut = async () => {
    try {
      console.log('🚪 Attempting to sign out...');
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      // Always treat signout as successful to clear local state
      console.log('✅ Signout completed');
      setUserData(null);
      setIsAuthenticated(false);
      setIsDropdownOpen(false);
      
      // Small delay before reload to ensure state is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      // Don't treat NEXT_REDIRECT as an error - it's the normal redirect mechanism
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        console.log('✅ Signout redirect completed successfully');
        setUserData(null);
        setIsAuthenticated(false);
        setIsDropdownOpen(false);
        window.location.reload();
        return;
      }
      
      console.log('⚠️ Signout error (continuing anyway):', error);
      // Even if there's an error, clear the local state
      setUserData(null);
      setIsAuthenticated(false);
      setIsDropdownOpen(false);
      window.location.reload();
    }
  };

  // Debug logging
  console.log('🎯 Render state:', {
    isAuthenticated,
    isLoading,
    error,
    userData: userData ? { id: userData.id, credits: userData.credits, plan: userData.plan } : null
  });

  return (
    <div className="flex items-center gap-2">
      {/* Credits Display */}
      {userData && isAuthenticated && (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <ZapIcon className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{userData.credits}</span>
          <Badge variant={userData.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
            {userData.plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-800 rounded-full">
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* User Button with Conditional Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UserIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isAuthenticated ? 'Profile' : 'Account'}
          </span>
        </button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
            <div className="py-1">
              {isAuthenticated ? (
                // Authenticated user options
                <>
                  <button
                    onClick={handleUpgrade}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <CrownIcon className="h-4 w-4" />
                    Upgrade to Pro
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                // Unauthenticated user options
                <button
                  onClick={handleSignIn}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <LogInIcon className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}