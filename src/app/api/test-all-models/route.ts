import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET() {
  try {
    console.log("🧪 Testing all available Gemini models...");
    
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
    
    // Test all available Gemini models
    const models = [
      "gemini-2.5-pro",
      "gemini-1.5-pro",
      "gemini-2.5-flash", 
      "gemini-2.5-pro",
      "gemini-2.0-flash-exp",
      "gemini-2.0-pro-exp"
    ];
    
    const results = [];
    
    for (const modelName of models) {
      try {
        console.log(`Testing ${modelName}...`);
        
        const model = google(modelName);
        
        const result = await generateText({
          model,
          prompt: "Say 'Hello'",
          maxTokens: 10,
        });
        
        results.push({
          model: modelName,
          success: true,
          response: result.text,
          usage: result.usage,
        });
        
        console.log(`✅ ${modelName} worked!`);
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.log(`❌ ${modelName} failed:`, error.message);
        
        const isQuotaError = error.message.includes('quota') || 
                           error.message.includes('429') || 
                           error.message.includes('RESOURCE_EXHAUSTED');
        
        results.push({
          model: modelName,
          success: false,
          error: error.message,
          isQuotaError,
          statusCode: error.statusCode,
        });
      }
    }
    
    // Find the best available model
    const workingModels = results.filter(r => r.success);
    const bestModel = workingModels.length > 0 ? workingModels[0].model : null;
    
    return Response.json({
      success: true,
      results,
      summary: {
        working: workingModels.map(r => r.model),
        failed: results.filter(r => !r.success).map(r => r.model),
        quotaIssues: results.filter(r => !r.success && r.isQuotaError).map(r => r.model),
        bestModel,
        recommendation: bestModel || "No working models found"
      }
    });
    
  } catch (error: any) {
    console.error("❌ Model test failed:", error);
    
    return Response.json(
      { 
        success: false, 
        error: error.message || "Unknown error",
        details: error.stack 
      },
      { status: 500 }
    );
  }
}