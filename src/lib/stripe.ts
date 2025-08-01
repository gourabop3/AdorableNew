import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1OqXqXqXqXqXqXqXqXqXqXqX',
    credits: 100,
    name: 'Pro Plan',
    price: 29.99,
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;