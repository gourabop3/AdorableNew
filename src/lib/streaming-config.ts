// Streaming configuration for optimal performance and stability
export const STREAMING_CONFIG = {
  // Stream speed control (in milliseconds) - Faster for better responsiveness
  STREAMING: {
    CHUNK_DELAY: 5, // Minimal delay for fast streaming
    STEP_DELAY: 5, // Minimal delay between AI steps
  },
  
  // Chat polling intervals (in milliseconds) - Less frequent to reduce refreshes
  POLLING: {
    REFETCH_INTERVAL: 5000, // Less frequent polling to reduce refreshes
    STALE_TIME: 3000, // Keep data fresh longer
    GC_TIME: 10000, // Longer cache time
  },
  
  // UI debouncing (in milliseconds) - Faster for better responsiveness
  DEBOUNCE: {
    RUNNING_STATE: 200, // Faster debounce for running state changes
    MESSAGE_SENDING: 100, // Faster input clearing
    SENDING_RESET: 300, // Faster state reset
  },
  
  // Request deduplication (in seconds)
  DEDUPLICATION: {
    REQUEST_TIMEOUT: 10, // How long to track duplicate requests
    MAX_ATTEMPTS: 60, // Max attempts to wait for stream cleanup
    ATTEMPT_DELAY: 500, // Delay between cleanup attempts
  }
};