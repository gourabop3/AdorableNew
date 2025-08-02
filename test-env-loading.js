require('dotenv').config();

console.log('🔍 Testing .env file loading...\n');

console.log('📋 Environment Variables Check:');
const vars = [
  'DATABASE_URL',
  'FREESTYLE_API_KEY', 
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY',
  'REDIS_URL'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Show first 10 characters to avoid exposing full keys
    const displayValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n🔍 Checking if .env file exists and is readable:');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const stats = fs.statSync(envPath);
  console.log(`📁 File size: ${stats.size} bytes`);
  console.log(`📅 Last modified: ${stats.mtime}`);
} else {
  console.log('❌ .env file does not exist');
}

console.log('\n🔍 First few lines of .env file:');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').slice(0, 5);
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        const displayValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
        console.log(`${index + 1}. ${key}=${displayValue}`);
      }
    }
  });
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
}