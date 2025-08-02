const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Webhook and Credit Update Issues...\n');

// Test 1: Check if webhook route exists
console.log('1. Checking webhook route...');
const webhookPath = path.join(__dirname, 'src/app/api/stripe/webhook/route.ts');
if (fs.existsSync(webhookPath)) {
  console.log('✅ Webhook route exists');
  
  // Check webhook content for proper credit update logic
  const webhookContent = fs.readFileSync(webhookPath, 'utf8');
  if (webhookContent.includes('credits: selectedPlan.credits')) {
    console.log('✅ Credit update logic found in webhook');
  } else {
    console.log('❌ Credit update logic missing in webhook');
  }
  
  if (webhookContent.includes('console.log')) {
    console.log('✅ Debug logging enabled in webhook');
  } else {
    console.log('❌ Debug logging missing in webhook');
  }
} else {
  console.log('❌ Webhook route not found');
}

// Test 2: Check if billing API exists
console.log('\n2. Checking billing API...');
const billingApiPath = path.join(__dirname, 'src/app/api/user/billing/route.ts');
if (fs.existsSync(billingApiPath)) {
  console.log('✅ Billing API exists');
  
  // Check if it properly returns user data
  const billingContent = fs.readFileSync(billingApiPath, 'utf8');
  if (billingContent.includes('credits: dbUser.credits')) {
    console.log('✅ Credit field properly returned in billing API');
  } else {
    console.log('❌ Credit field missing in billing API response');
  }
} else {
  console.log('❌ Billing API not found');
}

// Test 3: Check if Stripe configuration exists
console.log('\n3. Checking Stripe configuration...');
const stripeConfigPath = path.join(__dirname, 'src/lib/stripe.ts');
if (fs.existsSync(stripeConfigPath)) {
  console.log('✅ Stripe configuration exists');
  
  const stripeContent = fs.readFileSync(stripeConfigPath, 'utf8');
  if (stripeContent.includes('credits: 100')) {
    console.log('✅ Pro plan credits configured correctly');
  } else {
    console.log('❌ Pro plan credits not configured');
  }
} else {
  console.log('❌ Stripe configuration not found');
}

// Test 4: Check if database schema includes credits field
console.log('\n4. Checking database schema...');
const schemaPath = path.join(__dirname, 'src/db/schema.ts');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Database schema exists');
  
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  if (schemaContent.includes('credits: integer')) {
    console.log('✅ Credits field exists in database schema');
  } else {
    console.log('❌ Credits field missing in database schema');
  }
} else {
  console.log('❌ Database schema not found');
}

// Test 5: Check if checkout session includes proper metadata
console.log('\n5. Checking checkout session creation...');
const checkoutPath = path.join(__dirname, 'src/app/api/stripe/create-checkout-session/route.ts');
if (fs.existsSync(checkoutPath)) {
  console.log('✅ Checkout session route exists');
  
  const checkoutContent = fs.readFileSync(checkoutPath, 'utf8');
  if (checkoutContent.includes('metadata')) {
    console.log('✅ Metadata included in checkout session');
  } else {
    console.log('❌ Metadata missing in checkout session');
  }
  
  if (checkoutContent.includes('userId')) {
    console.log('✅ User ID included in metadata');
  } else {
    console.log('❌ User ID missing in metadata');
  }
} else {
  console.log('❌ Checkout session route not found');
}

console.log('\n🔍 Potential Issues to Check:');
console.log('   1. Webhook endpoint not configured in Stripe dashboard');
console.log('   2. Webhook secret not set in environment variables');
console.log('   3. Database connection issues');
console.log('   4. User ID mismatch between checkout and webhook');
console.log('   5. Webhook events not being received');
console.log('   6. Database transaction failures');

console.log('\n📋 Debugging Steps:');
console.log('   1. Check Stripe dashboard webhook logs');
console.log('   2. Verify webhook endpoint URL is correct');
console.log('   3. Check environment variables (STRIPE_WEBHOOK_SECRET)');
console.log('   4. Monitor application logs for webhook events');
console.log('   5. Test webhook with Stripe CLI');
console.log('   6. Check database directly for user credit updates');

console.log('\n🚀 Next Steps:');
console.log('   1. Set up Stripe CLI for local webhook testing');
console.log('   2. Add more detailed logging to webhook handler');
console.log('   3. Test webhook with sample data');
console.log('   4. Verify database migrations ran successfully');
console.log('   5. Check if user is being created properly');