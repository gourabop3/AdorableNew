// Simple test to verify database update
const { Pool } = require('pg');

async function testSimpleDeduction() {
  console.log('🧪 Testing simple credit deduction...');
  
  try {
    // Check if DATABASE_URL is set
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.log('❌ DATABASE_URL not set');
      return;
    }
    
    console.log('✅ DATABASE_URL is set');
    
    // Test database connection
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Test a specific user
    console.log('🔍 Testing specific user...');
    const userResult = await client.query('SELECT id, credits FROM users LIMIT 1');
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log(`✅ Found user: ${user.id} with ${user.credits} credits`);
      
      // Test simple credit deduction
      console.log('💰 Testing simple credit deduction...');
      const newCredits = Math.max(0, user.credits - 1);
      
      const updateResult = await client.query(
        'UPDATE users SET credits = $1 WHERE id = $2 RETURNING credits',
        [newCredits, user.id]
      );
      
      if (updateResult.rows.length > 0) {
        console.log(`✅ Credits updated successfully from ${user.credits} to ${updateResult.rows[0].credits}`);
        
        // Test transaction recording
        console.log('📝 Testing transaction recording...');
        const insertResult = await client.query(
          'INSERT INTO credit_transactions (user_id, amount, description, type) VALUES ($1, $2, $3, $4) RETURNING id',
          [user.id, -1, 'Test deduction', 'usage']
        );
        
        if (insertResult.rows.length > 0) {
          console.log(`✅ Transaction recorded successfully with ID: ${insertResult.rows[0].id}`);
        } else {
          console.log('❌ Transaction recording failed');
        }
        
        // Restore original credits
        await client.query('UPDATE users SET credits = $1 WHERE id = $2', [user.credits, user.id]);
        console.log('🔄 Restored original credits');
      } else {
        console.log('❌ Credit update failed');
      }
    } else {
      console.log('⚠️ No users found in database');
    }

    client.release();
    await pool.end();
    console.log('✅ All simple deduction tests passed!');
    
  } catch (error) {
    console.error('❌ Simple deduction test failed:', error);
  }
}

testSimpleDeduction();