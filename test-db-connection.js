const { Pool } = require('pg');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('apps', 'users', 'app_users', 'messages', 'credit_transactions', 'subscriptions')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Found tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check if required tables exist
    const requiredTables = ['apps', 'users', 'app_users', 'messages', 'credit_transactions', 'subscriptions'];
    const foundTables = tablesResult.rows.map(row => row.table_name);
    
    const missingTables = requiredTables.filter(table => !foundTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables);
      console.log('💡 Run: npx drizzle-kit push');
    } else {
      console.log('✅ All required tables exist');
    }
    
    // Test a simple query
    const testQuery = await client.query('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users in database:', testQuery.rows[0].count);
    
    client.release();
    await pool.end();
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure:');
    console.error('   1. DATABASE_URL is set correctly');
    console.error('   2. Database server is running');
    console.error('   3. Database exists and is accessible');
  }
}

testDatabaseConnection();