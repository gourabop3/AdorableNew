require('dotenv').config();

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    const response = await fetch('http://localhost:3000/api/user/billing', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('Error testing auth:', error);
  }
}

testAuth();