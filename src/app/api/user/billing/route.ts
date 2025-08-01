import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/auth/stack-auth';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      // Create new user with 50 free credits
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: user.email || '',
        name: user.name || '',
        image: user.image || '',
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