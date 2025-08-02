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
      // User not authenticated - return 401 without logging as error
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      try {
        // Create new user with 50 free credits
        const newUser = await db.insert(users).values({
          id: user.userId,
          email: user.email || `user-${user.userId}@example.com`,
          name: user.name || 'User',
          image: user.image || '',
          credits: 50,
          plan: 'free',
        }).returning();

        dbUser = newUser[0];
      } catch (insertError) {
        console.error('Database error creating user:', insertError);
        return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
      }
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User data unavailable' }, { status: 503 });
    }

    // Get subscription data
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, dbUser.id),
    });

    const responseData = {
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
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}