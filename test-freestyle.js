const { FreestyleSandboxes } = require('freestyle-sandboxes');

async function testFreestyleAPI() {
  console.log('🔍 Testing Freestyle API connection...');
  
  if (!process.env.FREESTYLE_API_KEY) {
    console.error('❌ FREESTYLE_API_KEY is not set');
    return;
  }
  
  try {
    const freestyle = new FreestyleSandboxes({
      apiKey: process.env.FREESTYLE_API_KEY,
    });
    
    console.log('✅ Freestyle client created successfully');
    
    // Test API key by trying to list identities
    console.log('🔍 Testing API key validity...');
    
    // This is a simple test - we'll try to create a git identity
    // which should work if the API key is valid
    const identity = await freestyle.createGitIdentity();
    console.log('✅ API key is valid');
    console.log('🆔 Created test identity:', identity.id);
    
    console.log('✅ Freestyle API test completed successfully');
    
  } catch (error) {
    console.error('❌ Freestyle API test failed:', error.message);
    console.error('💡 Make sure:');
    console.error('   1. FREESTYLE_API_KEY is set correctly');
    console.error('   2. API key is valid and active');
    console.error('   3. You have sufficient credits/quota');
  }
}

testFreestyleAPI();