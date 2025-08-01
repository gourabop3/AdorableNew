import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({
        error: 'Database connection not available',
        dbObject: 'Null'
      }, { status: 500 });
    }

    // Test if we can connect to the database
    try {
      await db.execute('SELECT 1 as test');
    } catch (error) {
      return NextResponse.json({
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Test if the users table exists
    let usersTableExists = false;
    try {
      await db.execute('SELECT 1 FROM users LIMIT 1');
      usersTableExists = true;
    } catch (error) {
      usersTableExists = false;
    }

    // Test if the subscriptions table exists
    let subscriptionsTableExists = false;
    try {
      await db.execute('SELECT 1 FROM subscriptions LIMIT 1');
      subscriptionsTableExists = true;
    } catch (error) {
      subscriptionsTableExists = false;
    }

    // Test if the credit_transactions table exists
    let creditTransactionsTableExists = false;
    try {
      await db.execute('SELECT 1 FROM credit_transactions LIMIT 1');
      creditTransactionsTableExists = true;
    } catch (error) {
      creditTransactionsTableExists = false;
    }

    return NextResponse.json({
      success: true,
      databaseConnection: 'Working',
      tables: {
        users: usersTableExists ? 'Exists' : 'Missing',
        subscriptions: subscriptionsTableExists ? 'Exists' : 'Missing',
        credit_transactions: creditTransactionsTableExists ? 'Exists' : 'Missing'
      },
      message: 'Database connection successful'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Database test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}