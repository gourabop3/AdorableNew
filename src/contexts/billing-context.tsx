"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BillingData {
  credits: number;
  plan: 'free' | 'pro';
  stripeCustomerId?: string;
}

interface BillingContextType {
  billing: BillingData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refetch: () => Promise<void>;
}

const defaultBilling: BillingData = {
  credits: 50,
  plan: 'free'
};

const BillingContext = createContext<BillingContextType>({
  billing: defaultBilling,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  refetch: async () => {}
});

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

interface BillingProviderProps {
  children: ReactNode;
}

export const BillingProvider: React.FC<BillingProviderProps> = ({ children }) => {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching billing data...');

      const response = await fetch('/api/user/billing');
      
      console.log('📡 Billing API response status:', response.status);
      
      if (response.status === 401) {
        // User not authenticated - this is fine
        console.log('🔐 User not authenticated');
        setIsAuthenticated(false);
        setBilling(null);
        return;
      }

      if (!response.ok) {
        // API error - try to get error details
        const errorText = await response.text();
        console.warn('⚠️ Billing API error:', response.status, errorText);
        
        // Use fallback data but mark as authenticated since we got a non-401 error
        setIsAuthenticated(true);
        setBilling(defaultBilling);
        setError(`Billing API error (${response.status}). Using default data.`);
        return;
      }

      const data = await response.json();
      console.log('✅ Billing API success:', data);
      
      if (data.user && data.user.id) {
        setIsAuthenticated(true);
        setBilling({
          credits: data.user.credits || 50,
          plan: data.user.plan || 'free',
          stripeCustomerId: data.user.stripeCustomerId
        });
        console.log('💳 Billing data set:', {
          credits: data.user.credits,
          plan: data.user.plan
        });
      } else {
        // Invalid response structure
        console.warn('⚠️ Invalid billing response structure:', data);
        setIsAuthenticated(true);
        setBilling(defaultBilling);
        setError('Invalid billing data structure, using defaults');
      }
    } catch (error) {
      // Network error or parsing error
      console.error('❌ Billing fetch failed:', error);
      
      // Try to maintain authentication state but provide fallback
      setIsAuthenticated(true);
      setBilling(defaultBilling);
      setError(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const value: BillingContextType = {
    billing,
    isLoading,
    error,
    isAuthenticated,
    refetch: fetchBillingData
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};