"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce stale time to prevent excessive caching
      staleTime: 5000, // Reduced from 30s to 5s
      // Keep retry attempts reasonable
      retry: 2,
      // Allow refetch on window focus for better UX
      refetchOnWindowFocus: true,
    },
  },
});

export function SharedQueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };