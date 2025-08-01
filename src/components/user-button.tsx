"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { ZapIcon, CrownIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

export function UserButton() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    setIsDropdownOpen(false);
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

      {/* Profile Button with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <UserIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</span>
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
                Upgrade to Pro
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={() => {
                  // Handle sign out
                  setIsDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}