import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 300000,        // 5 minutes - increased from 30 seconds
  connectionTimeoutMillis: 30000,   // 30 seconds - increased from 2 seconds
  acquireTimeoutMillis: 60000,      // 1 minute to acquire connection from pool
  allowExitOnIdle: false,           // Don't exit when idle
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Add connection acquire timeout handling
pool.on('acquire', (client) => {
  console.log('Client acquired from pool');
});

pool.on('connect', (client) => {
  console.log('Client connected to database');
});

// Database health check function
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database pool...');
  await pool.end();
  process.exit(0);
});

export const db = drizzle(pool, { schema });
