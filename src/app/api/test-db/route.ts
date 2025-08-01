import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL not set',
        message: 'Please set the DATABASE_URL environment variable'
      }, { status: 500 });
    }

    // Check if db object exists
    if (!db) {
      return NextResponse.json({
        error: 'Database connection not available',
        message: 'The db object is undefined'
      }, { status: 500 });
    }

    // Try a simple query to test connection
    try {
      // This is a simple test query that should work even if tables don't exist
      await db.execute('SELECT 1 as test');
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      });
    } catch (queryError) {
      return NextResponse.json({
        error: 'Database query failed',
        message: queryError instanceof Error ? queryError.message : 'Unknown error',
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Database connection error',
      message: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}