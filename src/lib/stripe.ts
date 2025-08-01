import Stripe from 'stripe';

// Check if required environment variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe operations will fail.');
}

// Create Stripe instance with error handling
let stripe: Stripe | null = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }
} catch (error) {
  console.error('Failed to create Stripe instance:', error);
  stripe = null;
}

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1OqXqXqXqXqXqXqXqXqXqXqX',
    credits: 100,
    name: 'Pro Plan',
    price: 29.99,
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;

export { stripe };