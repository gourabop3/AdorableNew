import { google } from "@ai-sdk/google";

// Enhanced error handling and logging for debugging
function validateApiKey() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set");
    throw new Error("Missing Google Generative AI API key. Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable.");
  }
  
  // Log first/last 4 characters for debugging (never log full key)
  const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
  console.log(`✅ Google API key loaded: ${maskedKey}`);
  
  return apiKey;
}

// Validate API key on module load
validateApiKey();

export const GOOGLE_MODEL = google("gemini-1.5-flash");
