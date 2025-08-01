require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return;
    }

    // Parse the URL to extract components
    const url = new URL(process.env.DATABASE_URL);
    console.log('Host:', url.hostname);
    console.log('Port:', url.port || '5432 (default)');
    console.log('Database:', url.pathname.slice(1));
    console.log('User:', url.username);

    // Try with explicit port if not specified
    let connectionString = process.env.DATABASE_URL;
    if (!url.port) {
      connectionString = process.env.DATABASE_URL.replace('@dpg-d24675h5pdvs73fv2os0-a/', '@dpg-d24675h5pdvs73fv2os0-a:5432/');
      console.log('Trying with explicit port 5432...');
    }

    const pool = new Pool({
      connectionString: connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Attempting to connect...');
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0].now);
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    
    // Try alternative connection methods
    if (error.code === 'ENOTFOUND') {
      console.log('\nTrying alternative connection methods...');
      
      // Try with different SSL settings
      try {
        const pool2 = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: false
        });
        
        console.log('Trying without SSL...');
        const client2 = await pool2.connect();
        console.log('✅ Database connection successful (without SSL)');
        client2.release();
        await pool2.end();
        
      } catch (error2) {
        console.error('❌ Alternative connection also failed:', error2.message);
      }
    }
  }
}

testConnection();