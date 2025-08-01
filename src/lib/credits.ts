import { db } from '@/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function deductCredits(userId: string, amount: number, description: string) {
  try {
    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    // Update user credits
    await db.update(users)
      .set({ 
        credits: user.credits - amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: -amount, // Negative for usage
      description,
      type: 'usage',
    });

    return { success: true, remainingCredits: user.credits - amount };
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
}

export async function addCredits(userId: string, amount: number, description: string, type: 'purchase' | 'bonus' | 'refund' = 'bonus') {
  try {
    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user credits
    await db.update(users)
      .set({ 
        credits: user.credits + amount,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Record transaction
    await db.insert(creditTransactions).values({
      userId,
      amount,
      description,
      type,
    });

    return { success: true, newCredits: user.credits + amount };
  } catch (error) {
    console.error('Error adding credits:', error);
    throw error;
  }
}

export async function getUserCredits(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user?.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    return 0;
  }
}