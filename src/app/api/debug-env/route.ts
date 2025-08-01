import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    return NextResponse.json({
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      dbObject: db ? 'Available' : 'Null',
      nodeEnv: process.env.NODE_ENV,
      allEnvVars: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set' : 'Not set',
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set',
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}