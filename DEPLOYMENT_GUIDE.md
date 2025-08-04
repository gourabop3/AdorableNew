# Complete Deployment Guide for Adorable

## Issues Fixed

✅ **Database Configuration**: Changed from PostgreSQL to MongoDB (the app uses MongoDB)  
✅ **Git Identity Error Handling**: Added graceful error handling for Freestyle API failures  
✅ **Billing API Improvements**: Better error handling and fallback mechanisms  
✅ **User Creation**: Fixed user creation in MongoDB with proper error handling  

## Required Environment Variables

### For Vercel Deployment

You need to set these environment variables in your Vercel project dashboard:

```bash
# Database - Use MongoDB Atlas for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adorable?retryWrites=true&w=majority

# Anthropic API (Required)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Freestyle API (Required for git operations)
FREESTYLE_API_KEY=your_freestyle_api_key_here

# Stack Auth (Required for authentication)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id_here
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key_here
STACK_SECRET_SERVER_KEY=your_stack_secret_key_here

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Preview Domain (Optional)
PREVIEW_DOMAIN=your-domain.com
```

## Setup Steps

### 1. Set Up MongoDB Atlas (Required)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get the connection string and set it as `MONGODB_URI` in Vercel

### 2. Set Up Stack Auth (Required)

1. Go to [Stack Auth Dashboard](https://app.stack-auth.com)
2. Create a new project
3. In Configuration → Domains, enable "Allow all localhost callbacks for development"
4. Copy the following values to Vercel:
   - Project ID → `NEXT_PUBLIC_STACK_PROJECT_ID`
   - Publishable Client Key → `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - Secret Server Key → `STACK_SECRET_SERVER_KEY`

### 3. Get Freestyle API Key (Required)

1. Go to [Freestyle Dashboard](https://admin.freestyle.sh/dashboard/api-tokens)
2. Create a new API key
3. Set it as `FREESTYLE_API_KEY` in Vercel

### 4. Get Anthropic API Key (Required)

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an API key
3. Set it as `ANTHROPIC_API_KEY` in Vercel

### 5. Deploy to Vercel

1. Set all environment variables in Vercel dashboard
2. Redeploy your project
3. Check the deployment logs for any errors

## Local Development Setup

For local development:

```bash
# Install dependencies
npm install

# Start MongoDB (using the installed MongoDB)
sudo -u mongodb mongod --dbpath /data/db &

# Start Redis (optional)
redis-server &

# Start the development server
npm run dev
```

## Troubleshooting

### Issue: "Failed to create git identity: Unauthorized"
**Solution**: Ensure `FREESTYLE_API_KEY` is set correctly in Vercel environment variables.

### Issue: "User not authenticated" in billing
**Solution**: Ensure all Stack Auth environment variables are set correctly.

### Issue: Database connection errors
**Solution**: Ensure `MONGODB_URI` is set correctly and MongoDB Atlas cluster is accessible.

### Issue: Billing dropdown not showing
**Solution**: This should be fixed once authentication is working properly with correct Stack Auth setup.

## Database Schema

The app will automatically create the necessary collections in MongoDB:
- `users` - User profiles and credits
- `apps` - User applications
- `messages` - Chat messages
- `subscriptions` - Billing subscriptions
- `appusers` - App permissions
- `appddeployments` - Deployment records
- `credittransactions` - Credit transactions

## Testing the Fix

After deployment, test these endpoints:
1. Visit your deployed URL
2. Sign up/Sign in using Stack Auth
3. Check if billing information appears in the profile dropdown
4. Try creating a new app

The app should now work correctly with proper authentication and database connectivity.