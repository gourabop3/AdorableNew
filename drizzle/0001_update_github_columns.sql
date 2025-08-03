-- Migration to rename freestyle columns to github columns in app_users table
ALTER TABLE "app_users" RENAME COLUMN "freestyle_identity" TO "github_username";
ALTER TABLE "app_users" RENAME COLUMN "freestyle_access_token" TO "github_access_token";
ALTER TABLE "app_users" RENAME COLUMN "freestyle_access_token_id" TO "github_installation_id";