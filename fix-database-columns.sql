-- Fix GitHub database schema by renaming columns
-- Run this on your database to fix the column mismatch

-- Check if columns exist first, then rename
DO $$
BEGIN
    -- Check if freestyle_identity exists and github_username doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' 
        AND column_name = 'freestyle_identity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' 
        AND column_name = 'github_username'
    ) THEN
        -- Rename the columns
        ALTER TABLE app_users RENAME COLUMN freestyle_identity TO github_username;
        ALTER TABLE app_users RENAME COLUMN freestyle_access_token TO github_access_token;
        ALTER TABLE app_users RENAME COLUMN freestyle_access_token_id TO github_installation_id;
        
        RAISE NOTICE 'Successfully renamed columns from freestyle_* to github_*';
    ELSE
        RAISE NOTICE 'Columns already have correct names or migration already applied';
    END IF;
END $$;