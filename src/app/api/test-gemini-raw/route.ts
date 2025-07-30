export async function GET() {
  try {
    console.log("🧪 Testing Gemini API directly...");
    
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
    
    // Direct API call to Google Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Respond with exactly: 'Gemini integration working!'"
            }]
          }],
          generationConfig: {
            maxOutputTokens: 20,
          }
        })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ Gemini API error:", data);
      return Response.json({
        success: false,
        error: "Gemini API call failed",
        statusCode: response.status,
        apiResponse: data,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: response.status });
    }
    
    console.log("✅ Gemini test successful:", data);
    
    return Response.json({
      success: true,
      response: data.candidates?.[0]?.content?.parts?.[0]?.text,
      apiResponse: data,
    });
    
  } catch (error: any) {
    console.error("❌ Gemini test failed:", error);
    
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