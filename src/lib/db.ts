import { drizzle } from "drizzle-orm/node-postgres";

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Database operations will fail.');
}

// Create database connection with error handling
let db: ReturnType<typeof drizzle> | null = null;

try {
  if (process.env.DATABASE_URL) {
    db = drizzle(process.env.DATABASE_URL);
  }
} catch (error) {
  console.error('Failed to create database connection:', error);
  db = null;
}

export { db };
