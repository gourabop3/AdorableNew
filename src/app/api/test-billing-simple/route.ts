import { NextResponse } from 'next/server';
import { getUser } from '@/auth/stack-auth';
import { connectToDatabase, db } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('🔍 Testing billing API...');
    
    let user;
    try {
      user = await getUser();
      console.log('✅ User authenticated:', user.userId);
    } catch (error) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔗 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ MongoDB connected');

    // Get user data
    let dbUser = await db.users.findById(user.userId);
    console.log('👤 User in database:', dbUser ? 'Found' : 'Not found');

    if (!dbUser) {
      console.log('➕ Creating new user...');
      dbUser = await db.users.create({
        id: user.userId,
        email: user.email || `user-${user.userId}@example.com`,
        name: user.name || 'User',
        image: user.image || '',
        credits: 50,
        plan: 'free',
      });
      console.log('✅ New user created');
    }

    // Get subscription data
    const subscriptions = await db.subscriptions.findMany({ userId: dbUser.id });
    const activeSubscription = subscriptions.find(sub => sub.status === 'active');
    console.log('💳 Active subscription:', activeSubscription ? 'Found' : 'None');

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
      test: 'Billing API is working!',
    };

    console.log('📤 Returning data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Test billing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}