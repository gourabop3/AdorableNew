# Billing System Implementation

This project now includes a comprehensive billing system with Stripe integration for managing user subscriptions and credits.

## Features

### User Credit System
- **Free Plan**: Users get 50 credits upon signup
- **Pro Plan**: Users get 100 credits per month for $29.99
- Credit tracking and transaction history
- Automatic credit deduction for app creation

### Stripe Integration
- Secure payment processing with Stripe Checkout
- Webhook handling for subscription lifecycle events
- Customer management and subscription tracking
- Automatic plan upgrades and downgrades

### UI Components
- **UserButton**: Shows current credits and plan status in the top-right corner
- **Billing Page**: Complete billing management interface at `/billing`
- **Upgrade Flow**: Seamless upgrade process with Stripe Checkout

## Database Schema

### New Tables Added
1. **users**: User profiles with credit balance and plan information
2. **subscriptions**: Stripe subscription tracking
3. **credit_transactions**: Credit usage and purchase history

### Key Fields
- `users.credits`: Current credit balance
- `users.plan`: Current plan (free/pro)
- `users.stripeCustomerId`: Stripe customer reference
- `subscriptions.status`: Subscription status tracking

## API Endpoints

### Billing Management
- `GET /api/user/billing`: Fetch user billing data
- `POST /api/stripe/create-checkout-session`: Create Stripe checkout
- `POST /api/stripe/cancel-subscription`: Cancel subscription
- `POST /api/stripe/webhook`: Stripe webhook handler

### Credit Management
- `deductCredits()`: Deduct credits for app creation
- `addCredits()`: Add credits (purchase/bonus)
- `getUserCredits()`: Get current credit balance

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id_here

# Database
DATABASE_URL=your_database_url_here

# Other configurations
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. Stripe Setup
1. Create a Stripe account and get your API keys
2. Create a product and price for the Pro plan ($29.99/month)
3. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Configure webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 3. Database Migration
Run the database migration to create the new tables:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

## Usage

### For Users
1. **Signup**: Automatically get 50 free credits
2. **View Credits**: See current balance in top-right corner
3. **Upgrade**: Click "Upgrade to Pro" in user dropdown
4. **Manage Billing**: Visit `/billing` for full billing management

### For Developers
1. **Credit Deduction**: Use `deductCredits()` when users create apps
2. **Credit Addition**: Use `addCredits()` for bonuses or refunds
3. **Credit Checking**: Use `getUserCredits()` to check balance

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── stripe/
│   │   │   ├── create-checkout-session/
│   │   │   ├── cancel-subscription/
│   │   │   └── webhook/
│   │   └── user/
│   │       └── billing/
│   └── billing/
│       └── page.tsx
├── components/
│   ├── user-button.tsx
│   └── ui/
│       └── badge.tsx
├── db/
│   └── schema.ts (updated)
├── lib/
│   ├── stripe.ts
│   └── credits.ts
└── app/
    └── page.tsx (updated)
```

## Security Features

- **Webhook Verification**: All Stripe webhooks are verified with signatures
- **User Authorization**: All API endpoints check user authentication
- **Subscription Validation**: Verify subscription ownership before operations
- **Credit Validation**: Prevent negative credit balances

## Testing

### Test Credit Flow
1. Create a new user account
2. Verify 50 credits are automatically assigned
3. Create an app (should deduct credits)
4. Upgrade to Pro plan
5. Verify 100 credits are added
6. Test subscription cancellation

### Test Stripe Integration
1. Use Stripe test cards for payment testing
2. Test webhook events in Stripe dashboard
3. Verify subscription lifecycle events
4. Test credit deduction and addition

## Future Enhancements

- Credit usage analytics
- Multiple plan tiers
- Credit purchase without subscription
- Usage-based billing
- Team billing features
- Invoice generation
- Payment method management

## Troubleshooting

### Common Issues
1. **Webhook failures**: Check webhook secret and endpoint URL
2. **Credit not updating**: Verify database migration ran successfully
3. **Stripe checkout errors**: Check API keys and price ID configuration
4. **User not found**: Ensure user creation in database

### Debug Steps
1. Check browser console for client-side errors
2. Check server logs for API errors
3. Verify Stripe dashboard for payment status
4. Check database for user and subscription records