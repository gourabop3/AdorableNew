require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, subscriptions } = require('./src/db/schema');

async function testAPI() {
  try {
    console.log('Testing API functionality...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const db = drizzle(pool, { schema: { users, subscriptions } });
    
    console.log('✅ Database connection successful');
    
    // Test the findFirst query that was failing
    console.log('Testing findFirst query...');
    
    // Test with a dummy user ID
    const testUserId = 'test-user-123';
    
    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, testUserId),
      });
      
      console.log('✅ findFirst query successful');
      console.log('User found:', user ? 'Yes' : 'No');
      
    } catch (error) {
      console.error('❌ findFirst query failed:', error.message);
    }
    
    // Test subscription query
    try {
      const subscription = await db.query.subscriptions.findFirst({
        where: (subscriptions, { eq }) => eq(subscriptions.userId, testUserId),
      });
      
      console.log('✅ Subscription query successful');
      console.log('Subscription found:', subscription ? 'Yes' : 'No');
      
    } catch (error) {
      console.error('❌ Subscription query failed:', error.message);
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();