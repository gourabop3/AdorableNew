// Test script to check credit deduction on deployed app
const https = require('https');

async function testDeployedCredits() {
  try {
    console.log('Testing credit deduction on deployed app...');
    
    // You'll need to replace this with your actual deployed URL
    const baseUrl = process.env.DEPLOYED_URL || 'https://your-app.onrender.com';
    
    console.log('Testing endpoints:');
    console.log('1. Billing API endpoint');
    console.log('2. App creation endpoint');
    
    // Test billing API
    console.log('\n1. Testing billing API...');
    const billingResponse = await makeRequest(`${baseUrl}/api/user/billing`);
    console.log('Billing API response:', billingResponse);
    
    // Test app creation (this would require authentication)
    console.log('\n2. Testing app creation...');
    console.log('Note: App creation requires authentication');
    console.log('To test credit deduction:');
    console.log('1. Sign in to your app');
    console.log('2. Try to create an app');
    console.log('3. Check the server logs for credit deduction messages');
    
    console.log('\nExpected log messages when creating an app:');
    console.log('- "Ensuring user [userId] exists in database..."');
    console.log('- "Checking credits for user [userId] (need 1)..."');
    console.log('- "User has [X] credits, needs 1"');
    console.log('- "Attempting to deduct 1 credit for user [userId]..."');
    console.log('- "✅ Credits deducted successfully for app creation"');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

testDeployedCredits();