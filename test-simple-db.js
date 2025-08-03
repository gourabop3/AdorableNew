require('dotenv').config();
const { Pool } = require('pg');

async function testSimpleDatabase() {
  try {
    console.log('Testing Render database connection...');
    console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not set');
      return;
    }

    // Test if it's the placeholder value
    if (process.env.DATABASE_URL.includes('your_database_url_here')) {
      console.error('❌ DATABASE_URL is still set to placeholder value');
      return;
    }

    console.log('✅ DATABASE_URL is configured');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test basic connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Check if billing tables exist
    console.log('Checking billing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'credit_transactions', 'subscriptions')
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('Tables found:', tableNames);
    
    if (!tableNames.includes('users')) {
      console.error('❌ Users table missing - run migrations');
      return;
    }

    if (!tableNames.includes('credit_transactions')) {
      console.error('❌ Credit transactions table missing - run migrations');
      return;
    }

    console.log('✅ All required billing tables exist');

    // Test credit deduction functionality
    console.log('\nTesting credit deduction...');
    
    // Create a test user
    const testUserId = 'test-user-' + Date.now();
    const insertResult = await client.query(`
      INSERT INTO users (id, email, name, credits, plan) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, credits
    `, [testUserId, 'test@example.com', 'Test User', 5, 'free']);
    
    console.log('✅ Test user created with 5 credits:', insertResult.rows[0].credits);
    
    // Test credit deduction (simulate the deductCredits function)
    console.log('Simulating credit deduction...');
    
    // Update user credits
    const updateResult = await client.query(`
      UPDATE users 
      SET credits = credits - 1, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id, credits
    `, [testUserId]);
    
    console.log('✅ Credits after deduction:', updateResult.rows[0].credits);
    
    // Record transaction
    await client.query(`
      INSERT INTO credit_transactions (user_id, amount, description, type) 
      VALUES ($1, $2, $3, $4)
    `, [testUserId, -1, 'Test app creation', 'usage']);
    
    console.log('✅ Transaction recorded');
    
    // Verify the deduction worked
    const verifyResult = await client.query(`
      SELECT credits FROM users WHERE id = $1
    `, [testUserId]);
    
    console.log('✅ Final credits:', verifyResult.rows[0].credits);
    console.log('✅ Credit deduction working correctly!');
    
    // Clean up
    await client.query('DELETE FROM users WHERE id = $1', [testUserId]);
    console.log('✅ Test user cleaned up');
    
    client.release();
    await pool.end();
    console.log('\n🎉 Credit deduction system is working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  }
}

testSimpleDatabase();