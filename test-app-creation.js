const { Pool } = require('pg');
const { FreestyleSandboxes } = require('freestyle-sandboxes');

async function testAppCreation() {
  console.log('🔍 Testing App Creation Process...\n');
  
  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables:');
  const requiredEnvVars = [
    'DATABASE_URL',
    'FREESTYLE_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'NEXT_PUBLIC_STACK_PROJECT_ID',
    'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
    'STACK_SECRET_SERVER_KEY',
    'REDIS_URL'
  ];
  
  let envIssues = 0;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('your_') && !value.includes('placeholder')) {
      console.log(`✅ ${varName}: SET`);
    } else {
      console.log(`❌ ${varName}: MISSING or DEFAULT`);
      envIssues++;
    }
  });
  
  if (envIssues > 0) {
    console.log(`\n❌ ${envIssues} environment variables are missing or have default values.`);
    console.log('This will cause the blank white page issue.');
    return;
  }
  
  // Test 2: Database Connection
  console.log('\n2️⃣ Testing Database Connection:');
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if required tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('apps', 'users', 'app_users', 'messages', 'credit_transactions', 'subscriptions')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const foundTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Found tables:', foundTables);
    
    const requiredTables = ['apps', 'users', 'app_users', 'messages', 'credit_transactions', 'subscriptions'];
    const missingTables = requiredTables.filter(table => !foundTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables);
      console.log('💡 Run: npx drizzle-kit push');
      client.release();
      await pool.end();
      return;
    } else {
      console.log('✅ All required tables exist');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('This will cause app creation to fail.');
    return;
  }
  
  // Test 3: Freestyle API
  console.log('\n3️⃣ Testing Freestyle API:');
  try {
    const freestyle = new FreestyleSandboxes({
      apiKey: process.env.FREESTYLE_API_KEY,
    });
    
    console.log('✅ Freestyle client created');
    
    // Test API key by creating a git identity
    const identity = await freestyle.createGitIdentity();
    console.log('✅ API key is valid');
    console.log('🆔 Created test identity:', identity.id);
    
  } catch (error) {
    console.error('❌ Freestyle API test failed:', error.message);
    console.error('This will cause app creation to fail.');
    return;
  }
  
  // Test 4: Redis Connection
  console.log('\n4️⃣ Testing Redis Connection:');
  try {
    const redis = require('redis');
    const client = redis.createClient({
      url: process.env.REDIS_URL
    });
    
    await client.connect();
    console.log('✅ Redis connection successful');
    
    // Test basic operations
    await client.set('test-key', 'test-value');
    const value = await client.get('test-key');
    console.log('✅ Redis read/write test successful');
    
    await client.disconnect();
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.error('This may cause issues with session management.');
  }
  
  console.log('\n✅ All tests completed!');
  console.log('\n💡 If all tests pass but you still get a blank page:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Check network tab for failed API requests');
  console.log('3. Verify user authentication is working');
  console.log('4. Check if the app creation process is timing out');
}

testAppCreation().catch(console.error);