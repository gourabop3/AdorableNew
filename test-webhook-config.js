// Test script to check webhook configuration
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking Webhook Configuration...\n');

// Test 1: Check if .env file exists
console.log('1. Checking environment file...');
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file not found');
}

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file exists');
} else {
  console.log('❌ .env.local file not found');
}

// Test 2: Check webhook route for proper secret handling
console.log('\n2. Checking webhook route configuration...');
const webhookPath = path.join(__dirname, 'src/app/api/stripe/webhook/route.ts');
if (fs.existsSync(webhookPath)) {
  const webhookContent = fs.readFileSync(webhookPath, 'utf8');
  
  if (webhookContent.includes('STRIPE_WEBHOOK_SECRET')) {
    console.log('✅ Webhook secret environment variable referenced');
  } else {
    console.log('❌ Webhook secret environment variable not found');
  }
  
  if (webhookContent.includes('stripe-signature')) {
    console.log('✅ Stripe signature verification included');
  } else {
    console.log('❌ Stripe signature verification missing');
  }
  
  if (webhookContent.includes('constructEvent')) {
    console.log('✅ Webhook event construction included');
  } else {
    console.log('❌ Webhook event construction missing');
  }
} else {
  console.log('❌ Webhook route not found');
}

// Test 3: Check checkout session for proper metadata
console.log('\n3. Checking checkout session metadata...');
const checkoutPath = path.join(__dirname, 'src/app/api/stripe/create-checkout-session/route.ts');
if (fs.existsSync(checkoutPath)) {
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
  
  if (checkoutContent.includes('plan')) {
    console.log('✅ Plan included in metadata');
  } else {
    console.log('❌ Plan missing in metadata');
  }
} else {
  console.log('❌ Checkout session route not found');
}

// Test 4: Check Stripe configuration
console.log('\n4. Checking Stripe configuration...');
const stripePath = path.join(__dirname, 'src/lib/stripe.ts');
if (fs.existsSync(stripePath)) {
  const stripeContent = fs.readFileSync(stripePath, 'utf8');
  
  if (stripeContent.includes('STRIPE_SECRET_KEY')) {
    console.log('✅ Stripe secret key referenced');
  } else {
    console.log('❌ Stripe secret key not found');
  }
  
  if (stripeContent.includes('STRIPE_PRO_PRICE_ID')) {
    console.log('✅ Stripe pro price ID referenced');
  } else {
    console.log('❌ Stripe pro price ID not found');
  }
} else {
  console.log('❌ Stripe configuration not found');
}

console.log('\n🔧 Required Environment Variables:');
console.log('   STRIPE_SECRET_KEY=sk_test_...');
console.log('   STRIPE_PUBLISHABLE_KEY=pk_test_...');
console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
console.log('   STRIPE_PRO_PRICE_ID=price_...');
console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');

console.log('\n🔧 Webhook Configuration Steps:');
console.log('   1. Go to Stripe Dashboard > Webhooks');
console.log('   2. Add endpoint: https://yourdomain.com/api/stripe/webhook');
console.log('   3. Select events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded');
console.log('   4. Copy the webhook signing secret');
console.log('   5. Set STRIPE_WEBHOOK_SECRET in your environment variables');

console.log('\n🔧 Testing Webhook:');
console.log('   1. Use Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook');
console.log('   2. Check webhook logs in Stripe Dashboard');
console.log('   3. Monitor application logs for webhook events');
console.log('   4. Test with Stripe test cards');

console.log('\n🚨 Common Issues:');
console.log('   - Webhook endpoint URL incorrect');
console.log('   - Webhook secret not set in environment');
console.log('   - Webhook events not selected in Stripe dashboard');
console.log('   - Network/firewall blocking webhook requests');
console.log('   - Application not accessible from internet (for production)');

console.log('\n📋 Debugging Checklist:');
console.log('   □ Verify STRIPE_WEBHOOK_SECRET is set');
console.log('   □ Check webhook endpoint URL in Stripe dashboard');
console.log('   □ Ensure webhook events are selected');
console.log('   □ Test webhook with Stripe CLI');
console.log('   □ Monitor application logs');
console.log('   □ Check webhook delivery status in Stripe dashboard');