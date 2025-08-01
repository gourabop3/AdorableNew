import { NextResponse } from 'next/server';
import { getUser } from '@/auth/stack-auth';
import { db } from '@/lib/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    let user;
    try {
      user = await getUser();
    } catch (error) {
      console.error('User authentication failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user.userId exists
    if (!user.userId) {
      console.error('User ID is undefined:', user);
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Get user data
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      // Create new user with 50 free credits
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: '', // Default empty email
        name: '', // Default empty name
        image: '', // Default empty image
        credits: 50,
        plan: 'free',
      }).returning()[0];
    }

    // Get subscription data
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, dbUser.id),
    });

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