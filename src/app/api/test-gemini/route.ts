import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET() {
  try {
    console.log("🧪 Testing Gemini integration...");
    
    // Check if API key is available
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { 
          success: false, 
          error: "GOOGLE_GENERATIVE_AI_API_KEY environment variable not set" 
        },
        { status: 500 }
      );
    }
    
    const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
    console.log(`✅ API key loaded: ${maskedKey}`);
    
    // Test Gemini model
    const model = google("gemini-2.5-pro");
    
    const result = await generateText({
      model,
      prompt: "Respond with exactly: 'Gemini integration working!'",
      maxTokens: 20,
    });
    
    console.log("✅ Gemini test successful:", result.text);
    
    return Response.json({
      success: true,
      response: result.text,
      apiKeyMasked: maskedKey,
      usage: result.usage,
    });
    
  } catch (error: any) {
    console.error("❌ Gemini test failed:", error);
    
    let errorMessage = error.message || "Unknown error";
    let statusCode = 500;
    let quotaDetails = null;
    
    // Extract detailed quota information
    if (error.responseBody) {
      try {
        const errorData = JSON.parse(error.responseBody);
        if (errorData.error?.details) {
          quotaDetails = errorData.error.details;
        }
      } catch (e) {
        console.warn("Could not parse error response body");
      }
    }
    
    if (errorMessage.includes("quota") || errorMessage.includes("billing") || error.statusCode === 429) {
      statusCode = 429;
      errorMessage = "API quota exceeded. Please check your Google AI API billing limits.";
    } else if (errorMessage.includes("API key") || errorMessage.includes("authentication")) {
      statusCode = 401;
      errorMessage = "API authentication failed. Please check your Google AI API key.";
    }
    
    return Response.json(
      { 
        success: false, 
        error: errorMessage,
        details: error.stack,
        quotaDetails,
        statusCode: error.statusCode,
        responseBody: error.responseBody
      },
      { status: statusCode }
    );
  }
}