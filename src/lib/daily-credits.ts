import { db } from '@/lib/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Daily Credit Management System (Inspired by Lovable.dev)
 * 
 * - All users get 5 daily credits that reset every 24 hours
 * - Daily credits are consumed first before monthly credits
 * - Pro/Business plans get additional monthly credits (100) + daily credits (5)
 * - Free users: 5 daily credits only
 */

export interface DailyCreditStatus {
  dailyCreditsRemaining: number;
  dailyCreditsUsed: number;
  totalDailyCredits: number;
  monthlyCredits: number;
  totalCredits: number;
  nextResetTime: Date;
  plan: 'free' | 'pro' | 'business';
}

/**
 * Check if daily credits need to be reset (every 24 hours)
 */
export async function checkAndResetDailyCredits(userId: string): Promise<void> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const lastReset = user.lastDailyCreditReset || user.createdAt;
    const timeSinceReset = now.getTime() - lastReset.getTime();
    const hoursElapsed = timeSinceReset / (1000 * 60 * 60);

    // Reset daily credits if 24 hours have passed
    if (hoursElapsed >= 24) {
      await db.update(users)
        .set({ 
          dailyCreditsUsed: 0,
          lastDailyCreditReset: now,
          updatedAt: now,
        })
        .where(eq(users.id, userId));

      // Log the daily credit reset
      await db.insert(creditTransactions).values({
        userId,
        amount: 5,
        description: 'Daily credits reset (5 credits)',
        type: 'bonus',
      });

      console.log(`✅ Daily credits reset for user ${userId}`);
    }
  } catch (error) {
    console.error('Error resetting daily credits:', error);
    throw error;
  }
}

/**
 * Get current daily credit status for a user
 */
export async function getDailyCreditStatus(userId: string): Promise<DailyCreditStatus> {
  try {
    // First check and reset daily credits if needed
    await checkAndResetDailyCredits(userId);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const dailyCreditsRemaining = Math.max(0, user.dailyCredits - user.dailyCreditsUsed);
    
    // Calculate monthly credits (total credits minus daily credits)
    const monthlyCredits = Math.max(0, user.credits - user.dailyCredits);
    
    // Calculate next reset time (24 hours from last reset)
    const lastReset = user.lastDailyCreditReset || user.createdAt;
    const nextResetTime = new Date(lastReset.getTime() + 24 * 60 * 60 * 1000);

    return {
      dailyCreditsRemaining,
      dailyCreditsUsed: user.dailyCreditsUsed,
      totalDailyCredits: user.dailyCredits,
      monthlyCredits,
      totalCredits: user.credits,
      nextResetTime,
      plan: user.plan,
    };
  } catch (error) {
    console.error('Error getting daily credit status:', error);
    throw error;
  }
}

/**
 * Deduct credits (daily first, then monthly)
 */
export async function deductCreditsWithDaily(userId: string, amount: number, description: string): Promise<{ success: boolean; remainingCredits: DailyCreditStatus }> {
  try {
    // First check and reset daily credits if needed
    await checkAndResetDailyCredits(userId);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const dailyCreditsAvailable = Math.max(0, user.dailyCredits - user.dailyCreditsUsed);
    const monthlyCredits = Math.max(0, user.credits - user.dailyCredits);
    const totalAvailable = dailyCreditsAvailable + monthlyCredits;

    if (totalAvailable < amount) {
      throw new Error('Insufficient credits');
    }

    let dailyCreditsToDeduct = 0;
    let monthlyCreditsToDeduct = 0;

    // Use daily credits first
    if (amount <= dailyCreditsAvailable) {
      dailyCreditsToDeduct = amount;
    } else {
      dailyCreditsToDeduct = dailyCreditsAvailable;
      monthlyCreditsToDeduct = amount - dailyCreditsAvailable;
    }

    // Update the database
    const newDailyCreditsUsed = user.dailyCreditsUsed + dailyCreditsToDeduct;
    const newTotalCredits = user.credits - monthlyCreditsToDeduct;

    await db.update(users)
      .set({ 
        dailyCreditsUsed: newDailyCreditsUsed,
        credits: newTotalCredits,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Record the transaction
    await db.insert(creditTransactions).values({
      userId,
      amount: -amount,
      description: `${description} (${dailyCreditsToDeduct} daily + ${monthlyCreditsToDeduct} monthly)`,
      type: 'usage',
    });

    // Get updated status
    const updatedStatus = await getDailyCreditStatus(userId);

    console.log(`✅ Credits deducted: ${amount} (${dailyCreditsToDeduct} daily + ${monthlyCreditsToDeduct} monthly)`);

    return { 
      success: true, 
      remainingCredits: updatedStatus 
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
}

/**
 * Format time until next reset
 */
export function formatTimeUntilReset(nextResetTime: Date): string {
  const now = new Date();
  const diffMs = nextResetTime.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Resetting now...';
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}