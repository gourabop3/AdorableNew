// Streaming configuration for better readability and performance
export const STREAMING_CONFIG = {
  // Chat polling intervals (in milliseconds)
  POLLING: {
    REFETCH_INTERVAL: 3000, // How often to check stream state
    STALE_TIME: 2000, // How long to keep data fresh
    GC_TIME: 10000, // How long to keep cache
  },
  
  // UI debouncing (in milliseconds)
  DEBOUNCE: {
    RUNNING_STATE: 500, // Debounce for running state changes
    MESSAGE_SENDING: 200, // Delay before sending message
    SENDING_RESET: 1000, // Time to reset sending state
  },
  
  // Stream speed control (in milliseconds)
  STREAMING: {
    CHUNK_DELAY: 30, // Delay between stream chunks
    STEP_DELAY: 100, // Delay between AI steps
    CHUNK_PROCESSING: 50, // Delay in chunk processing
  },
  
  // Request deduplication (in seconds)
  DEDUPLICATION: {
    REQUEST_TIMEOUT: 10, // How long to track duplicate requests
    MAX_ATTEMPTS: 60, // Max attempts to wait for stream cleanup
    ATTEMPT_DELAY: 500, // Delay between cleanup attempts
  }
};