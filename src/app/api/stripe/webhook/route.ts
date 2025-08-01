import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users, subscriptions, creditTransactions, STRIPE_PLANS } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan && STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
          const selectedPlan = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
          
          // Update user plan and add credits
          await db.update(users)
            .set({ 
              plan: 'pro',
              credits: selectedPlan.credits,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          // Create subscription record
          await db.insert(subscriptions).values({
            id: session.subscription as string,
            userId,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: selectedPlan.priceId,
            status: 'active',
            currentPeriodStart: new Date(session.created * 1000),
            currentPeriodEnd: new Date((session.created + 30 * 24 * 60 * 60) * 1000),
          });

          // Record credit transaction
          await db.insert(creditTransactions).values({
            userId,
            amount: selectedPlan.credits,
            description: `Pro plan subscription - ${selectedPlan.credits} credits`,
            type: 'purchase',
            stripePaymentIntentId: session.payment_intent as string,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const dbSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, subscription.id),
        });

        if (dbSubscription) {
          await db.update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update user back to free plan
        const dbSubscription = await db.query.subscriptions.findFirst({
          where: eq(subscriptions.stripeSubscriptionId, subscription.id),
        });

        if (dbSubscription) {
          await db.update(users)
            .set({ 
              plan: 'free',
              updatedAt: new Date(),
            })
            .where(eq(users.id, dbSubscription.userId));

          await db.update(subscriptions)
            .set({
              status: 'canceled',
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}