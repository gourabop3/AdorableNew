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
      console.log('🔍 getUser() result:', user);
    } catch (error) {
      console.error('❌ User authentication failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      console.log('❌ User is null/undefined');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user.userId exists
    if (!user.userId) {
      console.error('❌ User ID is undefined:', user);
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    console.log('✅ User authenticated with ID:', user.userId);

    // Get user data
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      console.log('📝 Creating new user in database...');
      try {
        // Create new user with 50 free credits
        const newUser = await db.insert(users).values({
          id: user.userId,
          email: user.email || `user-${user.userId}@example.com`, // Use user email or generate one
          name: user.name || 'User', // Use user name or default
          image: user.image || '', // Use user image or empty
          credits: 50,
          plan: 'free',
        }).returning();

        if (!newUser || newUser.length === 0) {
          console.error('❌ Failed to create user - no data returned');
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        dbUser = newUser[0];
        console.log('✅ User created successfully:', dbUser.id);
      } catch (insertError) {
        console.error('❌ Error creating user:', insertError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    } else {
      console.log('✅ User found in database:', dbUser.id);
    }

    // Verify dbUser exists and has required fields
    if (!dbUser || !dbUser.id) {
      console.error('❌ dbUser is invalid after creation/lookup:', dbUser);
      return NextResponse.json({ error: 'User data is invalid' }, { status: 500 });
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

    console.log('✅ Returning user data:', responseData.user.id);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching user billing data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}