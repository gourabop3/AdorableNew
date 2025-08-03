// Simple test script to verify credit deduction
const BASE_URL = 'http://localhost:3000';

async function testCreditDeduction() {
  console.log('🧪 Testing credit deduction...');
  
  try {
    // First, check if server is running
    console.log('📡 Checking if server is running...');
    const healthCheck = await fetch(`${BASE_URL}/api/test-billing`);
    
    if (!healthCheck.ok) {
      console.log('❌ Server not responding or not authenticated');
      console.log('Status:', healthCheck.status);
      return;
    }
    
    const healthData = await healthCheck.json();
    console.log('✅ Server is running');
    console.log('👤 Current user data:', {
      id: healthData.user?.id,
      credits: healthData.user?.credits,
      plan: healthData.user?.plan
    });
    
    // Test credit deduction
    console.log('\n💰 Testing credit deduction...');
    const deductResponse = await fetch(`${BASE_URL}/api/test-billing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deduct',
        amount: 5
      })
    });
    
    if (deductResponse.ok) {
      const deductData = await deductResponse.json();
      console.log('✅ Credit deduction successful:', deductData);
    } else {
      const errorData = await deductResponse.json();
      console.log('❌ Credit deduction failed:', errorData);
    }
    
    // Check updated credits
    console.log('\n📊 Checking updated credits...');
    const updatedResponse = await fetch(`${BASE_URL}/api/test-billing`);
    if (updatedResponse.ok) {
      const updatedData = await updatedResponse.json();
      console.log('✅ Updated user data:', {
        id: updatedData.user?.id,
        credits: updatedData.user?.credits,
        plan: updatedData.user?.plan
      });
      
      // Show recent transactions
      if (updatedData.transactions && updatedData.transactions.length > 0) {
        console.log('📝 Recent transactions:');
        updatedData.transactions.slice(0, 3).forEach((tx, i) => {
          console.log(`  ${i + 1}. ${tx.description} - ${tx.amount} credits (${tx.type})`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testCreditDeduction();