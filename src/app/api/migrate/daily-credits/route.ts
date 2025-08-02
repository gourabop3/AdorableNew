import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Database Migration API for Daily Credits
 * Call this endpoint once after deployment to add daily credit fields
 * 
 * Usage: POST /api/migrate/daily-credits
 * 
 * This will:
 * 1. Add daily credit columns to users table
 * 2. Initialize existing users with daily credits
 * 3. Update credit allocations based on plan
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting daily credits migration...');

    // Step 1: Add new columns for daily credits
    console.log('📝 Adding daily credit columns...');
    
    try {
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS daily_credits INTEGER DEFAULT 5,
        ADD COLUMN IF NOT EXISTS daily_credits_used INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_daily_credit_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ Daily credit columns added successfully');
    } catch (error: any) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('ℹ️ Daily credit columns already exist, skipping...');
      } else {
        throw error;
      }
    }

    // Step 2: Update existing users to have daily credits
    console.log('👥 Updating existing users with daily credits...');
    
    const updateResult = await db.execute(sql`
      UPDATE users 
      SET 
        daily_credits = COALESCE(daily_credits, 5),
        daily_credits_used = COALESCE(daily_credits_used, 0),
        last_daily_credit_reset = COALESCE(last_daily_credit_reset, CURRENT_TIMESTAMP)
      WHERE daily_credits IS NULL OR daily_credits_used IS NULL OR last_daily_credit_reset IS NULL
    `);

    console.log(`✅ Updated users with daily credits`);

    // Step 3: Adjust credit allocations based on plan
    console.log('💰 Adjusting credit allocations by plan...');
    
    // Free users: Set to 5 credits (daily only)
    const freeResult = await db.execute(sql`
      UPDATE users 
      SET credits = 5
      WHERE plan = 'free' AND credits != 5
    `);

    // Pro users: Set to 100 monthly credits
    const proResult = await db.execute(sql`
      UPDATE users 
      SET credits = 100
      WHERE plan = 'pro' AND credits < 100
    `);

    console.log('✅ Credit allocations updated by plan');

    // Step 4: Get summary of migration
    const userCounts = await db.execute(sql`
      SELECT 
        plan,
        COUNT(*) as user_count,
        AVG(credits) as avg_credits,
        AVG(daily_credits) as avg_daily_credits
      FROM users 
      GROUP BY plan
      ORDER BY plan
    `);

    const totalUsers = await db.execute(sql`
      SELECT COUNT(*) as total FROM users
    `);

    console.log('🎉 Daily credits migration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Daily credits migration completed successfully',
      summary: {
        totalUsers: totalUsers.rows[0]?.total || 0,
        usersByPlan: userCounts.rows,
        changes: {
          columnsAdded: ['daily_credits', 'daily_credits_used', 'last_daily_credit_reset'],
          freeUsersUpdated: 'Set to 5 credits (daily only)',
          proUsersUpdated: 'Set to 100 monthly credits + 5 daily credits',
        }
      },
      instructions: {
        next: [
          '1. Verify the migration worked correctly',
          '2. Test app creation with 1 credit cost',
          '3. Check daily credit reset functionality',
          '4. Monitor user credit balances'
        ]
      }
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// GET endpoint to check migration status
export async function GET(request: NextRequest) {
  try {
    // Check if daily credit columns exist
    const columnCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
        AND column_name IN ('daily_credits', 'daily_credits_used', 'last_daily_credit_reset')
    `);

    const hasColumns = columnCheck.rows.length === 3;

    if (!hasColumns) {
      return NextResponse.json({
        migrated: false,
        message: 'Daily credits migration not yet applied',
        missingColumns: ['daily_credits', 'daily_credits_used', 'last_daily_credit_reset'].filter(
          col => !columnCheck.rows.some((row: any) => row.column_name === col)
        )
      });
    }

    // Get current user stats
    const userStats = await db.execute(sql`
      SELECT 
        plan,
        COUNT(*) as user_count,
        AVG(credits) as avg_credits,
        AVG(daily_credits) as avg_daily_credits,
        AVG(daily_credits_used) as avg_daily_used
      FROM users 
      GROUP BY plan
      ORDER BY plan
    `);

    return NextResponse.json({
      migrated: true,
      message: 'Daily credits migration has been applied',
      userStats: userStats.rows,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check migration status',
      details: error.message
    }, { status: 500 });
  }
}