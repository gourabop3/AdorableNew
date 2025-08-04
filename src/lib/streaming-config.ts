// Streaming configuration for controlled readability and responsiveness
export const STREAMING_CONFIG = {
  // Stream speed control (in milliseconds)
  STREAMING: {
    CHUNK_DELAY: 15, // Delay between stream chunks for readability
    STEP_DELAY: 10, // Delay between AI steps for readability
  },
  
  // Chat polling intervals (in milliseconds)
  POLLING: {
    REFETCH_INTERVAL: 2500, // How often to check stream state
    STALE_TIME: 1500, // How long to keep data fresh
    GC_TIME: 5000, // How long to keep cache
  },
  
  // UI debouncing (in milliseconds)
  DEBOUNCE: {
    RUNNING_STATE: 400, // Debounce for running state changes
    MESSAGE_SENDING: 50, // Delay before clearing input
    SENDING_RESET: 500, // Time to reset sending state
  },
  
  // Request deduplication (in seconds)
  DEDUPLICATION: {
    REQUEST_TIMEOUT: 10, // How long to track duplicate requests
    MAX_ATTEMPTS: 60, // Max attempts to wait for stream cleanup
    ATTEMPT_DELAY: 500, // Delay between cleanup attempts
  }
};