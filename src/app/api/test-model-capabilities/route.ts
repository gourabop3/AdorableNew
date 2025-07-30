import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function GET() {
  try {
    console.log("🧪 Testing different Gemini models for app creation capabilities...");
    
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
    
    const testPrompt = `Create a simple React component for a todo list. The component should:
1. Display a list of todos
2. Allow adding new todos
3. Allow marking todos as complete
4. Use modern React hooks

Please provide the complete component code.`;
    
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro", 
      "gemini-1.5-pro-latest"
    ];
    
    const results = [];
    
    for (const modelName of models) {
      try {
        console.log(`Testing ${modelName}...`);
        
        const model = google(modelName);
        
        const result = await generateText({
          model,
          prompt: testPrompt,
          maxTokens: 2000,
        });
        
        results.push({
          model: modelName,
          success: true,
          response: result.text,
          usage: result.usage,
        });
        
        console.log(`✅ ${modelName} worked!`);
        
      } catch (error: any) {
        console.log(`❌ ${modelName} failed:`, error.message);
        
        results.push({
          model: modelName,
          success: false,
          error: error.message,
        });
      }
    }
    
    return Response.json({
      success: true,
      results,
      summary: {
        working: results.filter(r => r.success).map(r => r.model),
        failed: results.filter(r => !r.success).map(r => r.model),
      }
    });
    
  } catch (error: any) {
    console.error("❌ Model capabilities test failed:", error);
    
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