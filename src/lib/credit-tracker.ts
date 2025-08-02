import { getUser } from "@/auth/stack-auth";
import { deductCreditsWithDaily, getDailyCreditStatus } from "@/lib/daily-credits";
import { InsufficientCreditsError } from "@/lib/errors";

/**
 * Credit Tracking System
 * 
 * Distinguishes between:
 * 1. App Creation (1 credit) - when creating a new app
 * 2. Chat Messages (1 credit per message) - when chatting within an app
 */

export type CreditAction = 'app_creation' | 'chat_message';

export interface CreditDeductionResult {
  success: boolean;
  remainingCredits: {
    dailyCreditsRemaining: number;
    monthlyCredits: number;
    totalCredits: number;
  };
  action: CreditAction;
  description: string;
}

/**
 * Check if user has enough credits for an action
 */
export async function checkCreditsForAction(
  userId: string, 
  action: CreditAction
): Promise<{ hasCredits: boolean; availableCredits: number }> {
  try {
    const creditStatus = await getDailyCreditStatus(userId);
    const totalAvailable = creditStatus.dailyCreditsRemaining + creditStatus.monthlyCredits;
    
    // Both actions cost 1 credit
    const requiredCredits = 1;
    
    return {
      hasCredits: totalAvailable >= requiredCredits,
      availableCredits: totalAvailable
    };
  } catch (error) {
    console.error('Error checking credits:', error);
    return { hasCredits: false, availableCredits: 0 };
  }
}

/**
 * Deduct credits for app creation
 */
export async function deductCreditsForAppCreation(userId: string): Promise<CreditDeductionResult> {
  try {
    const result = await deductCreditsWithDaily(
      userId, 
      1, 
      'App creation'
    );

    console.log(`✅ App creation credit deducted for user ${userId}`);
    
    return {
      success: true,
      remainingCredits: {
        dailyCreditsRemaining: result.remainingCredits.dailyCreditsRemaining,
        monthlyCredits: result.remainingCredits.monthlyCredits,
        totalCredits: result.remainingCredits.totalCredits,
      },
      action: 'app_creation',
      description: 'App creation (1 credit)',
    };
  } catch (error: any) {
    console.error('Failed to deduct credits for app creation:', error);
    throw error;
  }
}

/**
 * Deduct credits for chat message
 */
export async function deductCreditsForChatMessage(
  userId: string, 
  appId: string, 
  messagePreview?: string
): Promise<CreditDeductionResult> {
  try {
    const preview = messagePreview ? ` - "${messagePreview.substring(0, 50)}..."` : '';
    const result = await deductCreditsWithDaily(
      userId, 
      1, 
      `Chat message in app ${appId}${preview}`
    );

    console.log(`✅ Chat message credit deducted for user ${userId} in app ${appId}`);
    
    return {
      success: true,
      remainingCredits: {
        dailyCreditsRemaining: result.remainingCredits.dailyCreditsRemaining,
        monthlyCredits: result.remainingCredits.monthlyCredits,
        totalCredits: result.remainingCredits.totalCredits,
      },
      action: 'chat_message',
      description: `Chat message (1 credit)${preview}`,
    };
  } catch (error: any) {
    console.error('Failed to deduct credits for chat message:', error);
    throw error;
  }
}

/**
 * Middleware to check and deduct credits before chat API
 */
export async function validateCreditsForChat(appId: string, messageContent?: string): Promise<{
  canProceed: boolean;
  userId?: string;
  error?: string;
}> {
  try {
    // Get current user
    const user = await getUser().catch(() => null);
    
    if (!user) {
      return {
        canProceed: false,
        error: 'User not authenticated'
      };
    }

    // Check if user has enough credits
    const creditCheck = await checkCreditsForAction(user.userId, 'chat_message');
    
    if (!creditCheck.hasCredits) {
      return {
        canProceed: false,
        userId: user.userId,
        error: `Insufficient credits. Available: ${creditCheck.availableCredits}, Required: 1`
      };
    }

    // Deduct credits for the chat message
    await deductCreditsForChatMessage(user.userId, appId, messageContent);

    return {
      canProceed: true,
      userId: user.userId
    };
  } catch (error: any) {
    console.error('Credit validation failed:', error);
    return {
      canProceed: false,
      error: error.message || 'Credit validation failed'
    };
  }
}

/**
 * Get user's current credit status for display
 */
export async function getCurrentCreditStatus(userId: string) {
  try {
    const status = await getDailyCreditStatus(userId);
    return {
      dailyCreditsRemaining: status.dailyCreditsRemaining,
      dailyCreditsUsed: status.dailyCreditsUsed,
      monthlyCredits: status.monthlyCredits,
      totalCredits: status.totalCredits,
      nextResetTime: status.nextResetTime,
      plan: status.plan,
    };
  } catch (error) {
    console.error('Error getting credit status:', error);
    return null;
  }
}