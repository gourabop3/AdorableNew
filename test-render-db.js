require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, creditTransactions } = require('./src/db/schema');
const { eq, sql } = require('drizzle-orm');

async function testRenderDatabase() {
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

    const db = drizzle(pool, { schema: { users, creditTransactions } });

    // Test basic connection
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Check if billing tables exist
    console.log('Checking billing tables...');
    const tablesResult = await db.execute(sql`
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
    const testUser = await db.insert(users).values({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      credits: 5,
      plan: 'free',
    }).returning();
    
    console.log('✅ Test user created with 5 credits:', testUser[0].credits);
    
    // Test credit deduction
    const { deductCredits } = require('./src/lib/credits.ts');
    await deductCredits(testUserId, 1, 'Test app creation');
    
    // Verify credits were deducted
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, testUserId),
    });
    
    console.log('✅ Credits after deduction:', updatedUser.credits);
    console.log('✅ Credit deduction working correctly!');
    
    // Check transaction was recorded
    const transactions = await db.query.creditTransactions.findMany({
      where: eq(creditTransactions.userId, testUserId),
    });
    
    console.log('✅ Transaction recorded:', transactions.length, 'transactions');
    
    // Clean up
    await db.delete(users).where(eq(users.id, testUserId));
    console.log('✅ Test user cleaned up');
    
    await pool.end();
    console.log('\n🎉 Credit deduction system is working correctly!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', error);
  }
}

testRenderDatabase();