"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Create a single QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce stale time to prevent excessive caching
      staleTime: 30000, // 30 seconds
      // Reduce retry attempts
      retry: 1,
      // Prevent refetch on window focus by default
      refetchOnWindowFocus: false,
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