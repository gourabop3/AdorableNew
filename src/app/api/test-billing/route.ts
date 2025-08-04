import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/auth/stack-auth';
import { connectToDatabase, db } from '@/lib/mongodb';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user data
    let dbUser = await db.users.findById(user.userId);
    if (!dbUser) {
      dbUser = await db.users.create({
        id: user.userId,
        email: user.email || `user-${user.userId}@example.com`,
        name: user.name || 'User',
        image: user.image || '',
        credits: 50,
        plan: 'free',
      });
    }

    // Get subscription data
    const subscriptions = await db.subscriptions.findMany({ userId: dbUser.id });
    const activeSubscription = subscriptions.find(sub => sub.status === 'active');

    // Get recent credit transactions
    const transactions = await db.creditTransactions.findMany({ userId: dbUser.id });

    return NextResponse.json({
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
      transactions: transactions.slice(0, 10), // Last 10 transactions
    });
  } catch (error) {
    console.error('Test billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, amount } = await req.json();

    await connectToDatabase();

    let dbUser = await db.users.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (action) {
      case 'add_credits':
        await db.users.update(dbUser.id, {
          credits: dbUser.credits + (amount || 10),
        });
        break;
      
      case 'use_credits':
        if (dbUser.credits < (amount || 1)) {
          return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }
        await db.users.update(dbUser.id, {
          credits: dbUser.credits - (amount || 1),
        });
        break;
      
      case 'upgrade_to_pro':
        await db.users.update(dbUser.id, {
          plan: 'pro',
          credits: 100,
        });
        break;
      
      case 'downgrade_to_free':
        await db.users.update(dbUser.id, {
          plan: 'free',
        });
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test billing POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}