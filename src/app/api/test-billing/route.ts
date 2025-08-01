import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/auth/stack-auth';
import { db } from '@/lib/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { deductCredits, addCredits, getUserCredits } from '@/lib/credits';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: user.email || '',
        name: user.name || '',
        image: user.image || '',
        credits: 50,
        plan: 'free',
      }).returning()[0];
    }

    // Get credit transactions
    const transactions = await db.query.creditTransactions.findMany({
      where: eq(creditTransactions.userId, user.userId),
      orderBy: (creditTransactions, { desc }) => [desc(creditTransactions.createdAt)],
      limit: 10,
    });

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        credits: dbUser.credits,
        plan: dbUser.plan,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        type: t.type,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error in test billing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, amount = 10 } = await request.json();

    switch (action) {
      case 'deduct':
        try {
          const result = await deductCredits(user.userId, amount, `Test deduction: ${amount} credits`);
          return NextResponse.json({ success: true, result });
        } catch (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

      case 'add':
        const result = await addCredits(user.userId, amount, `Test addition: ${amount} credits`);
        return NextResponse.json({ success: true, result });

      case 'get':
        const credits = await getUserCredits(user.userId);
        return NextResponse.json({ success: true, credits });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test billing POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}