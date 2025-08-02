import { google } from "@ai-sdk/google";
import { generateText } from "ai";

interface QuotaError {
  message: string;
  statusCode?: number;
  responseBody?: string;
  retryDelay?: number;
}

export function isQuotaError(error: any): error is QuotaError {
  return (
    error?.message?.includes('quota') ||
    error?.message?.includes('429') ||
    error?.statusCode === 429 ||
    error?.message?.includes('RESOURCE_EXHAUSTED')
  );
}

export function extractRetryDelay(error: QuotaError): number {
  try {
    if (error.responseBody) {
      const errorData = JSON.parse(error.responseBody);
      if (errorData.error?.details) {
        const retryInfo = errorData.error.details.find((detail: any) => 
          detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );
        if (retryInfo?.retryDelay) {
          return parseInt(retryInfo.retryDelay.replace('s', ''));
        }
      }
    }
  } catch (error) {
    console.warn("Could not parse retry delay from error:", error);
  }
  return 60; // default 60 seconds
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (isQuotaError(error)) {
        const retryDelay = extractRetryDelay(error);
        console.log(`⏰ Quota exceeded. Waiting ${retryDelay} seconds before retry ${attempt + 1}/${maxRetries + 1}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
        continue;
      }
      
      // For other errors, use exponential backoff
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⚠️ Error occurred. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export async function testGeminiConnection(): Promise<{
  success: boolean;
  response?: string;
  error?: string;
  quotaInfo?: {
    retryDelay?: number;
    isQuotaExceeded: boolean;
  };
}> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "GOOGLE_GENERATIVE_AI_API_KEY environment variable not set"
      };
    }

    const model = google("gemini-2.5-pro");
    
    const result = await generateText({
      model,
      prompt: "Respond with exactly: 'Gemini connection test successful!'",
      maxTokens: 20,
    });
    
    return {
      success: true,
      response: result.text,
    };
    
  } catch (error: any) {
    if (isQuotaError(error)) {
      const retryDelay = extractRetryDelay(error);
      return {
        success: false,
        error: "API quota exceeded",
        quotaInfo: {
          retryDelay,
          isQuotaExceeded: true,
        }
      };
    }
    
    return {
      success: false,
      error: error.message || "Unknown error occurred"
    };
  }
}

export function getQuotaStatusMessage(error: QuotaError): string {
  const retryDelay = extractRetryDelay(error);
  
  return `🚫 Gemini API quota exceeded. 
  
⏰ Please wait ${retryDelay} seconds before trying again.

💡 To avoid this issue in the future:
• Upgrade to a paid Google AI API plan for higher quotas
• Implement request rate limiting in your application
• Consider using a different model or reducing request frequency

📊 Current limits (Free Tier):
• 15 requests per minute
• 1,500 requests per day
• 32,000 input tokens per minute

🔗 Learn more: https://ai.google.dev/gemini-api/docs/rate-limits`;
}