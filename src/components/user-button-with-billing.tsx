"use client";

import { useState, useEffect, useRef } from "react";
import { UserButton as StackUserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ZapIcon, 
  CrownIcon, 
  UserIcon, 
  LogOutIcon, 
  LogInIcon, 
  AlertCircle, 
  SparklesIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  MonitorIcon,
  UsersIcon,
  MailIcon,
  ShieldIcon,
  CreditCardIcon,
  DownloadIcon,
  HelpCircleIcon,
  BellIcon,
  GlobeIcon,
  PaletteIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useBilling } from "@/contexts/billing-context";
import { toast } from "sonner";

export function UserButtonWithBilling() {
  const { billing, isLoading, error, isAuthenticated } = useBilling();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isInviteMenuOpen, setIsInviteMenuOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock theme state - replace with actual theme context
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsThemeMenuOpen(false);
        setIsInviteMenuOpen(false);
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

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
    toast.success(`Theme changed to ${newTheme}`);
    // Add actual theme implementation here
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Mock API call - replace with actual invite API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setIsInviteMenuOpen(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/invite?ref=${billing?.user?.id || 'user'}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInviteLink(true);
      toast.success('Invite link copied to clipboard');
      setTimeout(() => setCopiedInviteLink(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invite link');
    }
  };

  const handleNavigate = (path: string) => {
    // Handle different navigation paths
    switch (path) {
      case '/settings':
        toast.info('Settings page coming soon!');
        break;
      case '/profile':
        toast.info('Profile page coming soon!');
        break;
      case '/security':
        toast.info('Security settings coming soon!');
        break;
      case '/help':
        toast.info('Help & Support coming soon!');
        break;
      case '/docs':
        router.push('/docs');
        break;
      case '/billing':
        router.push('/billing');
        break;
      default:
        router.push(path);
    }
    setIsDropdownOpen(false);
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
          className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {billing?.user?.name || 'User'}
          </span>
          <ChevronDownIcon className="h-3 w-3 text-gray-500" />
        </Button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
            <div className="p-4">
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {billing?.user?.name || 'User Name'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {billing?.user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>

              {/* Plan & Credits Info */}
              {billing && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 mb-4">
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
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                    <div className="flex items-center gap-2">
                      <ZapIcon className="h-3 w-3 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {billing.plan === 'pro' ? `${billing.credits}/100` : `${billing.credits}/5`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900 dark:border-gray-100"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !billing && (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
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
                {/* Invite Section */}
                <div className="relative">
                  <button
                    onClick={() => setIsInviteMenuOpen(!isInviteMenuOpen)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                  >
                    <UsersIcon className="h-4 w-4" />
                    Invite Team Members
                    <ChevronDownIcon className="h-3 w-3 ml-auto" />
                  </button>
                  
                  {isInviteMenuOpen && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <form onSubmit={handleInviteUser} className="space-y-3">
                        <div>
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isInviting || !inviteEmail.trim()}
                            className="flex-1"
                          >
                            {isInviting ? 'Sending...' : 'Send Invite'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyInviteLink}
                            className="flex items-center gap-1"
                          >
                            {copiedInviteLink ? (
                              <CheckIcon className="h-3 w-3" />
                            ) : (
                              <CopyIcon className="h-3 w-3" />
                            )}
                            Copy Link
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                  >
                    <PaletteIcon className="h-4 w-4" />
                    Theme
                    <ChevronDownIcon className="h-3 w-3 ml-auto" />
                  </button>
                  
                  {isThemeMenuOpen && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="space-y-1">
                        <button
                          onClick={() => handleThemeChange('light')}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 ${
                            theme === 'light' 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <SunIcon className="h-3 w-3" />
                          Light
                        </button>
                        <button
                          onClick={() => handleThemeChange('dark')}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 ${
                            theme === 'dark' 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <MoonIcon className="h-3 w-3" />
                          Dark
                        </button>
                        <button
                          onClick={() => handleThemeChange('system')}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 ${
                            theme === 'system' 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <MonitorIcon className="h-3 w-3" />
                          System
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings & Account */}
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </button>

                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </button>

                <button
                  onClick={() => handleNavigate('/billing')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <CreditCardIcon className="h-4 w-4" />
                  {billing?.plan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro'}
                </button>

                {/* Security */}
                <button
                  onClick={() => handleNavigate('/security')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <ShieldIcon className="h-4 w-4" />
                  Security
                </button>

                {/* Help & Support */}
                <button
                  onClick={() => handleNavigate('/help')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <HelpCircleIcon className="h-4 w-4" />
                  Help & Support
                </button>

                <button
                  onClick={() => handleNavigate('/docs')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2 transition-colors"
                >
                  <GlobeIcon className="h-4 w-4" />
                  Documentation
                  <ExternalLinkIcon className="h-3 w-3 ml-auto" />
                </button>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2 transition-colors"
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