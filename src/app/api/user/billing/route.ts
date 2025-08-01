import { NextResponse } from 'next/server';
import { getUser } from '@/auth/stack-auth';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if database connection is available
    if (!db) {
      console.error('Database connection not available');
      // Return fallback data to prevent frontend crashes
      return NextResponse.json({
        user: {
          id: user.userId,
          email: user.email || '',
          name: user.name || '',
          credits: 50, // Default credits
          plan: 'free',
          stripeCustomerId: null,
        },
        subscription: null,
        databaseError: true
      });
    }

    // Get user data
    let dbUser;
    try {
      dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.userId),
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return fallback data to prevent frontend crashes
      return NextResponse.json({
        user: {
          id: user.userId,
          email: user.email || '',
          name: user.name || '',
          credits: 50, // Default credits
          plan: 'free',
          stripeCustomerId: null,
        },
        subscription: null,
        databaseError: true
      });
    }

    if (!dbUser) {
      // Create new user with 50 free credits
      try {
        dbUser = await db.insert(users).values({
          id: user.userId,
          email: user.email || '',
          name: user.name || '',
          image: user.image || '',
          credits: 50,
          plan: 'free',
        }).returning()[0];
      } catch (insertError) {
        console.error('Error creating user:', insertError);
        // Return fallback data to prevent frontend crashes
        return NextResponse.json({
          user: {
            id: user.userId,
            email: user.email || '',
            name: user.name || '',
            credits: 50, // Default credits
            plan: 'free',
            stripeCustomerId: null,
          },
          subscription: null,
          databaseError: true
        });
      }
    }

    // Get subscription data
    let subscription = null;
    try {
      subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, dbUser.id),
      });
    } catch (subError) {
      console.error('Error fetching subscription:', subError);
      // Don't fail the entire request if subscription query fails
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        credits: dbUser.credits,
        plan: dbUser.plan,
        stripeCustomerId: dbUser.stripeCustomerId,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching user billing data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}