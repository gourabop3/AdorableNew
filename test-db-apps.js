require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseApps() {
  console.log('🔍 Testing Database Apps...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    return;
  }
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test 1: Check if apps table exists and has data
    console.log('\n1️⃣ Checking apps table:');
    const appsResult = await client.query('SELECT COUNT(*) as count FROM apps');
    console.log(`📊 Total apps in database: ${appsResult.rows[0].count}`);
    
    if (appsResult.rows[0].count > 0) {
      const sampleApps = await client.query('SELECT id, name, created_at FROM apps LIMIT 5');
      console.log('📋 Sample apps:');
      sampleApps.rows.forEach((app, index) => {
        console.log(`  ${index + 1}. ID: ${app.id}, Name: ${app.name}, Created: ${app.created_at}`);
      });
    }
    
    // Test 2: Check if app_users table exists and has data
    console.log('\n2️⃣ Checking app_users table:');
    const appUsersResult = await client.query('SELECT COUNT(*) as count FROM app_users');
    console.log(`📊 Total app_users in database: ${appUsersResult.rows[0].count}`);
    
    if (appUsersResult.rows[0].count > 0) {
      const sampleAppUsers = await client.query('SELECT user_id, app_id, permissions FROM app_users LIMIT 5');
      console.log('📋 Sample app_users:');
      sampleAppUsers.rows.forEach((appUser, index) => {
        console.log(`  ${index + 1}. User: ${appUser.user_id}, App: ${appUser.app_id}, Permissions: ${appUser.permissions}`);
      });
    }
    
    // Test 3: Check if users table exists and has data
    console.log('\n3️⃣ Checking users table:');
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Total users in database: ${usersResult.rows[0].count}`);
    
    if (usersResult.rows[0].count > 0) {
      const sampleUsers = await client.query('SELECT id, email, credits, plan FROM users LIMIT 5');
      console.log('📋 Sample users:');
      sampleUsers.rows.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Credits: ${user.credits}, Plan: ${user.plan}`);
      });
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('💡 This could be why app history is not working');
  }
}

testDatabaseApps().catch(console.error);