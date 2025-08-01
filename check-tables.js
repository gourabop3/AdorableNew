require('dotenv').config();
const { Pool } = require('pg');

async function checkTables() {
  try {
    console.log('Checking database tables...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions', 'credit_transactions', 'apps', 'app_users', 'messages', 'app_deployments')
    `);
    
    console.log('Existing tables:', result.rows.map(row => row.table_name));
    
    if (result.rows.length === 0) {
      console.log('No tables found. Creating tables...');
      
      // Create tables manually
      await client.query(`
        CREATE TYPE IF NOT EXISTS "app_user_permission" AS ENUM('read', 'write', 'admin');
        CREATE TYPE IF NOT EXISTS "subscription_plan" AS ENUM('free', 'pro');
      `);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" text PRIMARY KEY NOT NULL,
          "email" text NOT NULL UNIQUE,
          "name" text,
          "image" text,
          "credits" integer DEFAULT 50 NOT NULL,
          "plan" "subscription_plan" DEFAULT 'free' NOT NULL,
          "stripe_customer_id" text UNIQUE,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS "subscriptions" (
          "id" text PRIMARY KEY NOT NULL,
          "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "stripe_subscription_id" text UNIQUE,
          "stripe_price_id" text NOT NULL,
          "status" text NOT NULL,
          "current_period_start" timestamp,
          "current_period_end" timestamp,
          "cancel_at_period_end" boolean DEFAULT false NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL,
          "updated_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS "credit_transactions" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "amount" integer NOT NULL,
          "description" text NOT NULL,
          "type" text NOT NULL,
          "stripe_payment_intent_id" text,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
      
      console.log('✅ Tables created successfully');
    } else {
      console.log('✅ Tables already exist');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();