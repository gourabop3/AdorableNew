require('dotenv').config();
const { Pool } = require('pg');

async function createBillingTables() {
  try {
    console.log('Creating billing tables...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Create enums
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "subscription_plan" AS ENUM('free', 'pro');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    // Create users table
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
    
    // Create subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "stripe_subscription_id" text UNIQUE,
        "stripe_price_id" text NOT NULL,
        "status" text NOT NULL,
        "current_period_start" timestamp,
        "current_period_end" timestamp,
        "cancel_at_period_end" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
    
    // Create credit_transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "credit_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" text NOT NULL,
        "amount" integer NOT NULL,
        "description" text NOT NULL,
        "type" text NOT NULL,
        "stripe_payment_intent_id" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
    
    console.log('✅ Billing tables created successfully');
    
    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'subscriptions', 'credit_transactions')
    `);
    
    console.log('Billing tables found:', result.rows.map(row => row.table_name));
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createBillingTables();