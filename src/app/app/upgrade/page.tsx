"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UpgradePrompt } from "@/components/upgrade-prompt";

interface UserData {
  credits: number;
  plan: "free" | "pro";
}

export default function UpgradePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const requiredCredits = 1; // Credits needed to create an app

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
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/billing');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account information...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Account</h1>
          <p className="text-gray-600 mb-6">Please try refreshing the page or contact support.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // If user has enough credits, redirect them to create an app (with guard)
  if (userData && userData.credits >= requiredCredits && !redirecting) {
    setRedirecting(true);
    
    // Get the original app creation parameters from URL
    const message = searchParams.get('message');
    const template = searchParams.get('template');
    
    // Redirect to app creation with original parameters
    const params = new URLSearchParams();
    if (message) params.set('message', message);
    if (template) params.set('template', template);
    
    router.push(`/app/new?${params.toString()}`);
    return null;
  }

  return (
    <UpgradePrompt
      currentCredits={userData.credits}
      requiredCredits={requiredCredits}
      onUpgrade={handleUpgrade}
      onGoHome={handleGoHome}
      showHomeButton={true}
    />
  );
}