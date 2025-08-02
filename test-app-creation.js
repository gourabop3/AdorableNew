// Test the app creation process step by step
import { createApp } from './src/actions/create-app.js';
import { getUser } from './src/auth/stack-auth.js';

async function testAppCreation() {
  console.log('🔍 Testing app creation process...');
  
  try {
    // Step 1: Test user authentication
    console.log('1️⃣ Testing user authentication...');
    const user = await getUser();
    console.log('✅ User authenticated:', user?.userId);
    
    // Step 2: Test app creation
    console.log('2️⃣ Testing app creation...');
    const app = await createApp({
      initialMessage: 'Test app creation',
      templateId: 'nextjs',
    });
    
    console.log('✅ App created successfully:', app.id);
    console.log('✅ App name:', app.name);
    console.log('✅ Git repo:', app.gitRepo);
    
  } catch (error) {
    console.error('❌ App creation test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
  }
}

testAppCreation();