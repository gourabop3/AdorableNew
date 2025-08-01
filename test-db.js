require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'your_database_url_here') {
      console.error('DATABASE_URL is not properly configured');
      return;
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions', 'credit_transactions')
    `);
    
    console.log('Tables found:', result.rows.map(row => row.table_name));
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testDatabase();