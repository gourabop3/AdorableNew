"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZapIcon, CrownIcon, UserIcon, LogOutIcon, SparklesIcon } from "lucide-react";

export default function TestBillingUI() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  
  // Mock billing data to show what the dropdown looks like
  const mockBilling = {
    credits: 42,
    plan: 'free' as const,
    stripeCustomerId: null
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🧪 Billing Dropdown Preview
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            This is what the Profile Dropdown looks like when authenticated:
          </h2>
          
          {/* Mock User Button with Dropdown */}
          <div className="flex justify-center">
            <div className="relative">
              <Button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Profile</span>
              </Button>
              
              {/* Mock Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {mockBilling.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                        </span>
                        <Badge variant={mockBilling.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
                          {mockBilling.plan === 'pro' ? (
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
                          {mockBilling.plan === 'pro' ? `${mockBilling.credits}/100` : `${mockBilling.credits}/50`}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                      {/* ✅ BILLING OPTION - THIS IS WHAT YOU'RE LOOKING FOR */}
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2">
                        <ZapIcon className="h-4 w-4" />
                        {mockBilling.plan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro'}
                      </button>

                      {/* Sign Out */}
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2">
                        <LogOutIcon className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              ✅ Billing Option IS Implemented!
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              The billing option shows as "<strong>Upgrade to Pro</strong>" for free users and 
              "<strong>Manage Billing</strong>" for pro users. It appears when the user is authenticated.
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              🔐 Why You Don't See It Locally:
            </h3>
            <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
              <li>• Stack Auth environment variables not set locally</li>
              <li>• User not authenticated (shows basic button instead)</li>
              <li>• Need to sign in through Stack Auth to see dropdown</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              🚀 To See It Working:
            </h3>
            <ol className="text-green-700 dark:text-green-300 text-sm space-y-1">
              <li>1. Set up Stack Auth in Vercel environment</li>
              <li>2. Set up MongoDB Atlas for database</li>
              <li>3. Deploy to Vercel with all environment variables</li>
              <li>4. Sign in on your live site</li>
              <li>5. Click the Profile button to see the dropdown</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}