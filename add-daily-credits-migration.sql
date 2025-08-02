-- Migration: Add Daily Credits System to Users Table
-- Run this SQL to add daily credit tracking fields

-- Add daily credit fields to users table
ALTER TABLE users 
ADD COLUMN daily_credits INTEGER NOT NULL DEFAULT 5,
ADD COLUMN daily_credits_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_daily_credit_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing users to have the daily credit fields
UPDATE users 
SET 
  daily_credits = 5,
  daily_credits_used = 0,
  last_daily_credit_reset = CURRENT_TIMESTAMP
WHERE daily_credits IS NULL;

-- Optional: Adjust initial credits for existing users to account for daily credits
-- This ensures existing users don't lose credits when switching to the new system
UPDATE users 
SET credits = CASE 
  WHEN plan = 'free' THEN 5  -- Free users get 5 daily credits only
  WHEN plan = 'pro' THEN 100 -- Pro users get 100 monthly + 5 daily (tracked separately)
  ELSE credits
END
WHERE credits < 5 OR plan = 'free';

-- Add comment to document the daily credit system
COMMENT ON COLUMN users.daily_credits IS 'Daily credits available (resets every 24h) - Lovable.dev style';
COMMENT ON COLUMN users.daily_credits_used IS 'Daily credits used today';
COMMENT ON COLUMN users.last_daily_credit_reset IS 'When daily credits were last reset';

-- Example queries to verify the migration:
-- SELECT id, email, plan, credits, daily_credits, daily_credits_used, last_daily_credit_reset FROM users LIMIT 5;
-- SELECT COUNT(*) as total_users, plan FROM users GROUP BY plan;