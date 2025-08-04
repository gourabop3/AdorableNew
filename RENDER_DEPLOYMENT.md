# Render Deployment with MongoDB

## 🚀 Quick Setup

### 1. Set up MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Add to Render environment variables

**Option B: Render MongoDB Service**
1. In Render dashboard → New → MongoDB
2. Create service
3. Copy connection string

### 2. Environment Variables

In your Render dashboard → Your App → Environment → Add:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adorable

# Keep existing variables
REDIS_URL=your_redis_url
GITHUB_TOKEN=your_github_token
FREESTYLE_API_KEY=your_freestyle_key
GOOGLE_AI_API_KEY=your_google_ai_key
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app-name.onrender.com
```

### 3. Remove Old Database Variables

Remove these from Render environment variables:
- `DATABASE_URL` (PostgreSQL)

## 🔧 Build Configuration

The build process will:
1. Run MongoDB setup script
2. Create database indexes
3. Test connection
4. Build Next.js app

## 📊 Database Schema

MongoDB collections:
- `apps` - Application data
- `appusers` - User-app relationships
- `messages` - Chat messages
- `users` - User accounts
- `subscriptions` - Billing data
- `credittransactions` - Credit history

## 🚨 Troubleshooting

### Connection Issues
- Check `MONGODB_URI` format
- Ensure network access is enabled
- Verify credentials

### Build Failures
- Check build logs in Render
- MongoDB setup errors won't fail the build
- App will work without database initially

### Performance
- MongoDB Atlas provides better performance
- Consider upgrading from free tier for production

## 🔄 Migration from PostgreSQL

If you have existing PostgreSQL data:

1. Export data from PostgreSQL
2. Use the migration script locally (if possible)
3. Or manually recreate data in MongoDB

## 📈 Benefits

- ✅ No more connection timeout issues
- ✅ Better performance
- ✅ Automatic scaling
- ✅ Built-in backup
- ✅ Cloud-native