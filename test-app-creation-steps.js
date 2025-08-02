require('dotenv').config();
const { Pool } = require('pg');
const { FreestyleSandboxes } = require('freestyle-sandboxes');

async function testAppCreationSteps() {
  console.log('🔍 Testing App Creation Steps...\n');
  
  // Test 1: Database Connection
  console.log('1️⃣ Testing Database Connection:');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test user query
    const userResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Users in database: ${userResult.rows[0].count}`);
    
    // Test apps query
    const appsResult = await client.query('SELECT COUNT(*) as count FROM apps');
    console.log(`📊 Apps in database: ${appsResult.rows[0].count}`);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }
  
  // Test 2: Freestyle API
  console.log('\n2️⃣ Testing Freestyle API:');
  try {
    const freestyle = new FreestyleSandboxes({
      apiKey: process.env.FREESTYLE_API_KEY,
    });
    
    console.log('✅ Freestyle client created');
    
    // Test creating a git identity
    const identity = await freestyle.createGitIdentity();
    console.log('✅ Git identity created:', identity.id);
    
    // Test creating a git repository
    const repo = await freestyle.createGitRepository({
      name: "Test App",
      public: true,
      source: {
        type: "git",
        url: "https://github.com/freestyle-sh/nextjs-template",
      },
    });
    console.log('✅ Git repository created:', repo.repoId);
    
    // Test granting permissions
    await freestyle.grantGitPermission({
      identityId: identity.id,
      repoId: repo.repoId,
      permission: "write",
    });
    console.log('✅ Git permissions granted');
    
    // Test creating access token
    const token = await freestyle.createGitAccessToken({
      identityId: identity.id,
    });
    console.log('✅ Git access token created');
    
    // Test requesting dev server
    const { mcpEphemeralUrl } = await freestyle.requestDevServer({
      repoId: repo.repoId,
    });
    console.log('✅ Dev server requested');
    console.log('✅ Ephemeral URL:', mcpEphemeralUrl ? 'Available' : 'Not available');
    
  } catch (error) {
    console.error('❌ Freestyle API test failed:', error.message);
    console.error('💡 This is likely the cause of app creation failure');
    return;
  }
  
  // Test 3: Credit System
  console.log('\n3️⃣ Testing Credit System:');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = await pool.connect();
    
    // Check if credit_transactions table exists
    const creditResult = await client.query('SELECT COUNT(*) as count FROM credit_transactions');
    console.log(`📊 Credit transactions in database: ${creditResult.rows[0].count}`);
    
    // Test user credits
    const userCreditsResult = await client.query('SELECT id, credits FROM users LIMIT 1');
    if (userCreditsResult.rows.length > 0) {
      const user = userCreditsResult.rows[0];
      console.log(`✅ User ${user.id} has ${user.credits} credits`);
      
      if (user.credits < 10) {
        console.log('⚠️ User has insufficient credits for app creation');
      } else {
        console.log('✅ User has sufficient credits for app creation');
      }
    } else {
      console.log('⚠️ No users found in database');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Credit system test failed:', error.message);
  }
  
  // Test 4: Environment Variables
  console.log('\n4️⃣ Testing Environment Variables:');
  const requiredVars = [
    'DATABASE_URL',
    'FREESTYLE_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
    'STACK_SECRET_SERVER_KEY',
    'REDIS_URL'
  ];
  
  let envIssues = 0;
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('your_') && !value.includes('placeholder') && !value.includes('actual_')) {
      console.log(`✅ ${varName}: SET`);
    } else {
      console.log(`❌ ${varName}: MISSING or DEFAULT`);
      envIssues++;
    }
  });
  
  if (envIssues > 0) {
    console.log(`\n❌ ${envIssues} environment variables are missing or have default values.`);
  } else {
    console.log('\n✅ All environment variables are properly set');
  }
  
  console.log('\n✅ App creation step tests completed!');
  console.log('\n💡 If all tests pass but app creation still fails:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Check server logs for detailed error messages');
  console.log('3. Verify user authentication is working');
  console.log('4. Check if the app creation process is timing out');
}

testAppCreationSteps().catch(console.error);