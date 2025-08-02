import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

export const redirectToCheckout = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const stripe = await getStripe();
    
    if (!stripe) {
      return { success: false, error: 'Stripe not available' };
    }
    
    const result = await stripe.redirectToCheckout({ sessionId });
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Stripe redirect error:', error);
    return { success: false, error: 'Failed to redirect to payment page' };
  }
};