require('dotenv').config();
const { Pool } = require('pg');

async function testSimple() {
  try {
    console.log('Testing simple database operations...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test if users table exists and can be queried
    const result = await client.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users table query successful');
    console.log('Number of users:', result.rows[0].count);
    
    // Test if subscriptions table exists and can be queried
    const subResult = await client.query('SELECT COUNT(*) FROM subscriptions');
    console.log('✅ Subscriptions table query successful');
    console.log('Number of subscriptions:', subResult.rows[0].count);
    
    // Test if credit_transactions table exists and can be queried
    const transResult = await client.query('SELECT COUNT(*) FROM credit_transactions');
    console.log('✅ Credit transactions table query successful');
    console.log('Number of transactions:', transResult.rows[0].count);
    
    client.release();
    await pool.end();
    
    console.log('✅ All database operations successful');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSimple();