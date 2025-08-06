// Streaming configuration for optimal performance and stability
export const STREAMING_CONFIG = {
  // Stream speed control (in milliseconds) - Controlled for readability
  STREAMING: {
    CHUNK_DELAY: 50, // More natural streaming speed
    STEP_DELAY: 10, // Small delay between AI steps for readability
  },
  
  // Chat polling intervals (in milliseconds) - Less frequent to reduce refreshes
  POLLING: {
    REFETCH_INTERVAL: 8000, // Much less frequent polling to reduce refreshes
    STALE_TIME: 5000, // Keep data fresh longer
    GC_TIME: 15000, // Longer cache time
  },
  
  // UI debouncing (in milliseconds) - Minimal for responsiveness
  DEBOUNCE: {
    RUNNING_STATE: 100, // Minimal debounce for running state changes
    MESSAGE_SENDING: 50, // Minimal input clearing delay
    SENDING_RESET: 200, // Faster state reset
  },
  
  // Request deduplication (in seconds)
  DEDUPLICATION: {
    REQUEST_TIMEOUT: 10, // How long to track duplicate requests
    MAX_ATTEMPTS: 60, // Max attempts to wait for stream cleanup
    ATTEMPT_DELAY: 500, // Delay between cleanup attempts
  }
};