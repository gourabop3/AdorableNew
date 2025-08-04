import { NextResponse } from 'next/server';
import { getUserBasic } from '@/auth/stack-auth';
import { connectToDatabase, db } from '@/lib/mongodb';

export async function GET() {
  try {
    let user;
    try {
      user = await getUserBasic();
    } catch (error) {
      console.log('User not authenticated:', error.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Billing API: Fetching data for user:', user.userId);

    try {
      await connectToDatabase();
      console.log('Billing API: Database connection successful');
    } catch (dbError) {
      console.error('Billing API: Database connection failed:', dbError);
      // Return fallback data if database is not available
      return NextResponse.json({
        user: {
          id: user.userId,
          email: user.email || `user-${user.userId}@example.com`,
          name: user.name || 'User',
          credits: 50,
          plan: 'free',
          stripeCustomerId: null,
        },
        subscription: null,
      });
    }

    // Get user data
    let dbUser;
    try {
      dbUser = await db.users.findById(user.userId);
      console.log('Billing API: Found user in database:', dbUser ? {
        id: dbUser.id,
        plan: dbUser.plan,
        credits: dbUser.credits,
        updatedAt: dbUser.updatedAt
      } : 'User not found');
    } catch (findError) {
      console.error('Billing API: Error finding user:', findError);
      dbUser = null;
    }

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
        console.error('Billing API: Database error creating user:', insertError);
        // Return fallback data if user creation fails
        return NextResponse.json({
          user: {
            id: user.userId,
            email: user.email || `user-${user.userId}@example.com`,
            name: user.name || 'User',
            credits: 50,
            plan: 'free',
            stripeCustomerId: null,
          },
          subscription: null,
        });
      }
    }

    if (!dbUser) {
      console.error('Billing API: User data still unavailable after creation attempt');
      return NextResponse.json({ error: 'User data unavailable' }, { status: 503 });
    }

    // Get subscription data
    let subscription = null;
    let activeSubscription = null;
    try {
      subscription = await db.subscriptions.findMany({ userId: dbUser.id });
      activeSubscription = subscription.find(sub => sub.status === 'active');

      console.log('Billing API: Found subscription:', activeSubscription ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        stripeSubscriptionId: activeSubscription.stripeSubscriptionId
      } : 'No subscription found');
    } catch (subscriptionError) {
      console.warn('Billing API: Error fetching subscription data:', subscriptionError);
      // Continue without subscription data
    }

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
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}