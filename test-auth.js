require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuth() {
  console.log('🔍 Testing Authentication System...\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Test 1: Check if auth endpoints are accessible
  console.log('1️⃣ Testing Auth Endpoints:');
  
  const endpoints = [
    '/api/user/billing',
    '/api/auth/signout',
    '/handler/sign-in',
    '/handler/sign-out'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint} is accessible`);
      } else if (response.status === 401) {
        console.log(`⚠️ ${endpoint} requires authentication (expected)`);
      } else if (response.status === 404) {
        console.log(`❌ ${endpoint} not found`);
      } else {
        console.log(`⚠️ ${endpoint} returned ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint} failed: ${error.message}`);
    }
  }
  
  // Test 2: Check Stack Auth configuration
  console.log('\n2️⃣ Testing Stack Auth Configuration:');
  
  const stackAuthVars = [
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
    'STACK_SECRET_SERVER_KEY'
  ];
  
  let stackAuthIssues = 0;
  stackAuthVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('your_') && !value.includes('placeholder')) {
      console.log(`✅ ${varName}: SET`);
    } else {
      console.log(`❌ ${varName}: MISSING or DEFAULT`);
      stackAuthIssues++;
    }
  });
  
  if (stackAuthIssues > 0) {
    console.log(`\n❌ ${stackAuthIssues} Stack Auth variables are missing.`);
    console.log('This will cause authentication to fail.');
    console.log('💡 Set up Stack Auth at: https://app.stack-auth.com');
  } else {
    console.log('\n✅ Stack Auth configuration looks good');
  }
  
  // Test 3: Check if billing API works
  console.log('\n3️⃣ Testing Billing API:');
  
  try {
    const response = await fetch(`${baseUrl}/api/user/billing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Billing API is working');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else if (response.status === 401) {
      console.log('⚠️ Billing API requires authentication (expected for unauthenticated users)');
    } else {
      console.log(`❌ Billing API returned ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Billing API failed: ${error.message}`);
  }
  
  // Test 4: Check sign-out endpoint
  console.log('\n4️⃣ Testing Sign-Out Endpoint:');
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Sign-out endpoint: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 401) {
      console.log('✅ Sign-out endpoint is working');
    } else {
      console.log(`❌ Sign-out endpoint returned ${response.status}`);
    }
    
  } catch (error) {
    console.log(`❌ Sign-out endpoint failed: ${error.message}`);
  }
  
  console.log('\n✅ Authentication tests completed!');
  console.log('\n💡 Common authentication issues:');
  console.log('1. Stack Auth not properly configured');
  console.log('2. Database connection issues');
  console.log('3. Redis connection issues');
  console.log('4. Missing environment variables');
  console.log('5. CORS issues in development');
}

testAuth().catch(console.error);