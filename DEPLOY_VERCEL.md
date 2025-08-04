# Deploy to Vercel

## 🚀 Quick Steps

### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 2. Or Deploy via GitHub
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### 3. Set Environment Variables
In Vercel dashboard → Your project → Settings → Environment Variables:

**Required:**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adorable
REDIS_URL=your_redis_url
GITHUB_TOKEN=your_github_token
FREESTYLE_API_KEY=your_freestyle_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

**Optional (for billing):**
```bash
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

**Auth:**
```bash
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### 4. Remove Old Variables
- Remove `DATABASE_URL` (PostgreSQL)

### 5. Deploy!
Vercel will automatically:
- Run MongoDB setup
- Create database indexes
- Build and deploy your app

## ✅ Benefits of Vercel
- Faster deployments
- Better Next.js integration
- Automatic preview deployments
- Edge functions support
- Global CDN

## 🔧 Configuration Files
- `vercel.json` - Vercel configuration
- `scripts/migrate-vercel.js` - MongoDB setup for Vercel
- `VERCEL_DEPLOYMENT.md` - Detailed guide