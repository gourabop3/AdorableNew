import { useRef, useCallback } from 'react';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  minInterval?: number; // Minimum time between requests
}

export function useRateLimit(options: RateLimitOptions) {
  const { maxRequests, windowMs, minInterval = 1000 } = options;
  const requestTimes = useRef<number[]>([]);
  const lastRequestTime = useRef<number>(0);

  const canMakeRequest = useCallback(() => {
    const now = Date.now();
    
    // Check minimum interval between requests
    if (now - lastRequestTime.current < minInterval) {
      return false;
    }
    
    // Remove old requests outside the time window
    requestTimes.current = requestTimes.current.filter(
      time => now - time < windowMs
    );
    
    // Check if we've exceeded the rate limit
    return requestTimes.current.length < maxRequests;
  }, [maxRequests, windowMs, minInterval]);

  const makeRequest = useCallback(() => {
    const now = Date.now();
    
    if (!canMakeRequest()) {
      return false;
    }
    
    requestTimes.current.push(now);
    lastRequestTime.current = now;
    return true;
  }, [canMakeRequest]);

  const getRemainingTime = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < minInterval) {
      return minInterval - timeSinceLastRequest;
    }
    
    if (requestTimes.current.length >= maxRequests) {
      const oldestRequest = Math.min(...requestTimes.current);
      return Math.max(0, windowMs - (now - oldestRequest));
    }
    
    return 0;
  }, [maxRequests, windowMs, minInterval]);

  return {
    canMakeRequest,
    makeRequest,
    getRemainingTime,
  };
}