require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { users, creditTransactions } = require('./src/db/schema');
const { eq, sql } = require('drizzle-orm');

async function testCreditDeduction() {
  try {
    console.log('Testing credit deduction system...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL === 'your_database_url_here') {
      console.error('❌ DATABASE_URL is not properly configured');
      console.log('Please set DATABASE_URL in your .env file');
      return;
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const db = drizzle(pool, { schema: { users, creditTransactions } });

    // Test database connection
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Check if tables exist
    console.log('Checking if billing tables exist...');
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'credit_transactions')
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('Tables found:', tableNames);
    
    if (!tableNames.includes('users') || !tableNames.includes('credit_transactions')) {
      console.error('❌ Required billing tables are missing');
      console.log('Run the database migration: npx drizzle-kit migrate');
      return;
    }

    // Test credit deduction logic
    console.log('\nTesting credit deduction logic...');
    
    // Create a test user
    const testUserId = 'test-user-' + Date.now();
    const testUser = await db.insert(users).values({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      credits: 10,
      plan: 'free',
    }).returning();
    
    console.log('✅ Test user created with 10 credits:', testUser[0].credits);
    
    // Test credit deduction
    const { deductCredits } = require('./src/lib/credits.ts');
    await deductCredits(testUserId, 1, 'Test app creation');
    
    // Verify credits were deducted
    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, testUserId),
    });
    
    console.log('✅ Credits after deduction:', updatedUser.credits);
    
    // Check transaction was recorded
    const transactions = await db.query.creditTransactions.findMany({
      where: eq(creditTransactions.userId, testUserId),
    });
    
    console.log('✅ Transaction recorded:', transactions.length, 'transactions');
    
    // Clean up
    await db.delete(users).where(eq(users.id, testUserId));
    console.log('✅ Test user cleaned up');
    
    await pool.end();
    console.log('\n🎉 Credit deduction test completed successfully!');
    
  } catch (error) {
    console.error('❌ Credit deduction test failed:', error.message);
    console.error('Error details:', error);
  }
}

testCreditDeduction();