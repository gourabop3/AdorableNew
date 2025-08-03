// Test database connection and credit deduction
const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection and credit deduction...');
  
  try {
    // Test database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Test querying users table
    console.log('👥 Testing users table query...');
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    console.log(`✅ Users table accessible, count: ${usersResult.rows[0].count}`);

    // Test credit transactions table
    console.log('📊 Testing credit_transactions table...');
    const transactionsResult = await client.query('SELECT COUNT(*) FROM credit_transactions');
    console.log(`✅ Credit transactions table accessible, count: ${transactionsResult.rows[0].count}`);

    // Test a specific user if exists
    console.log('🔍 Testing specific user query...');
    const userResult = await client.query('SELECT id, credits FROM users LIMIT 1');
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`✅ Found user: ${user.id} with ${user.credits} credits`);
      
      // Test credit deduction
      console.log('💰 Testing credit deduction...');
      const newCredits = Math.max(0, user.credits - 1);
      await client.query('UPDATE users SET credits = $1 WHERE id = $2', [newCredits, user.id]);
      console.log(`✅ Updated credits from ${user.credits} to ${newCredits}`);
      
      // Test transaction recording
      console.log('📝 Testing transaction recording...');
      await client.query(
        'INSERT INTO credit_transactions (user_id, amount, description, type) VALUES ($1, $2, $3, $4)',
        [user.id, -1, 'Test deduction', 'usage']
      );
      console.log('✅ Transaction recorded successfully');
      
      // Restore original credits
      await client.query('UPDATE users SET credits = $1 WHERE id = $2', [user.credits, user.id]);
      console.log('🔄 Restored original credits');
    } else {
      console.log('⚠️ No users found in database');
    }

    client.release();
    await pool.end();
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseConnection();