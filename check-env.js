#!/usr/bin/env node

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
  'DATABASE_URL',
  'FREESTYLE_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY',
  'REDIS_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRO_PRICE_ID'
];

const optionalVars = [
  'PREVIEW_DOMAIN',
  'NEXT_PUBLIC_APP_URL'
];

console.log('📋 Required Environment Variables:');
let missingRequired = 0;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_' + varName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_here') {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`❌ ${varName}: MISSING or DEFAULT`);
    missingRequired++;
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_' + varName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_here') {
    console.log(`✅ ${varName}: SET`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n📊 Summary:');
if (missingRequired === 0) {
  console.log('✅ All required environment variables are set!');
} else {
  console.log(`❌ ${missingRequired} required environment variables are missing or have default values.`);
  console.log('\n🔧 To fix the blank page issue:');
  console.log('1. Copy the .env.example file to .env');
  console.log('2. Fill in your actual API keys and database URLs');
  console.log('3. Restart the development server');
}

console.log('\n💡 Quick Setup:');
console.log('1. Get a Freestyle API key from: https://admin.freestyle.sh/dashboard/api-tokens');
console.log('2. Set up Stack Auth at: https://app.stack-auth.com');
console.log('3. Set up a PostgreSQL database (Neon is recommended)');
console.log('4. Set up Redis (Docker: docker run -p 6379:6379 redis)');
console.log('5. Set up Stripe for billing (optional but recommended)');