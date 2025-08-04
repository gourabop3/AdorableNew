import { NextResponse } from 'next/server';
import { getUserBasic } from '@/auth/stack-auth';
import { connectToDatabase, db } from '@/lib/mongodb';

export async function GET() {
  try {
    let user;
    try {
      user = await getUserBasic();
    } catch (error) {
      // User not authenticated - return 401 without logging as error
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Billing API: Fetching data for user:', user.userId);

    await connectToDatabase();

    // Get user data
    let dbUser = await db.users.findById(user.userId);

    console.log('Billing API: Found user in database:', dbUser ? {
      id: dbUser.id,
      plan: dbUser.plan,
      credits: dbUser.credits,
      updatedAt: dbUser.updatedAt
    } : 'User not found');

    if (!dbUser) {
      try {
        console.log('Billing API: Creating new user with 50 free credits');
        // Create new user with 50 free credits
        dbUser = await db.users.create({
          id: user.userId,
          email: user.email || `user-${user.userId}@example.com`,
          name: user.name || 'User',
          image: user.image || '',
          credits: 50,
          plan: 'free',
        });

        console.log('Billing API: New user created:', {
          id: dbUser.id,
          plan: dbUser.plan,
          credits: dbUser.credits
        });
      } catch (insertError) {
        console.error('Database error creating user:', insertError);
        return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
      }
    }

    if (!dbUser) {
      return NextResponse.json({ error: 'User data unavailable' }, { status: 503 });
    }

    // Get subscription data
    const subscription = await db.subscriptions.findMany({ userId: dbUser.id });
    const activeSubscription = subscription.find(sub => sub.status === 'active');

    console.log('Billing API: Found subscription:', activeSubscription ? {
      id: activeSubscription.id,
      status: activeSubscription.status,
      stripeSubscriptionId: activeSubscription.stripeSubscriptionId
    } : 'No subscription found');

    const responseData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        credits: dbUser.credits,
        plan: dbUser.plan,
        stripeCustomerId: dbUser.stripeCustomerId,
      },
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        currentPeriodEnd: activeSubscription.currentPeriodEnd?.toISOString(),
        cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
      } : null,
    };

    console.log('Billing API: Returning data:', {
      userId: responseData.user.id,
      plan: responseData.user.plan,
      credits: responseData.user.credits,
      hasSubscription: !!responseData.subscription
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}