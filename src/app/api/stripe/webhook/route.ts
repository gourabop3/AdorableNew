import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';
import { db } from '@/lib/db';
import { users, subscriptions, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook: Missing signature or webhook secret');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        console.log('Processing checkout.session.completed:', { userId, plan });

        if (userId && plan && STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
          const selectedPlan = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
          
          console.log('Updating user plan and credits:', { userId, plan: selectedPlan.name, credits: selectedPlan.credits });
          
          // Update user plan and add credits
          const updatedUser = await db.update(users)
            .set({ 
              plan: 'pro',
              credits: selectedPlan.credits,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

          console.log('User updated successfully:', updatedUser[0]?.id);

          // Create subscription record
          const newSubscription = await db.insert(subscriptions).values({
            id: session.subscription as string,
            userId,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: selectedPlan.priceId,
            status: 'active',
            currentPeriodStart: new Date(session.created * 1000),
            currentPeriodEnd: new Date((session.created + 30 * 24 * 60 * 60) * 1000),
          }).returning();

          console.log('Subscription created:', newSubscription[0]?.id);

          // Record credit transaction
          const creditTransaction = await db.insert(creditTransactions).values({
            userId,
            amount: selectedPlan.credits,
            description: `Pro plan subscription - ${selectedPlan.credits} credits`,
            type: 'purchase',
            stripePaymentIntentId: session.payment_intent as string,
          }).returning();

          console.log('Credit transaction recorded:', creditTransaction[0]?.id);
        } else {
          console.error('Invalid webhook data:', { userId, plan });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Processing subscription.updated:', subscription.id);
        
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
          
          console.log('Subscription updated successfully');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Processing subscription.deleted:', subscription.id);
        
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
          
          console.log('Subscription canceled and user reverted to free plan');
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Processing invoice.payment_succeeded:', invoice.id);
        
        // Handle recurring payments - add credits for renewal
        if (invoice.subscription) {
          const dbSubscription = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.stripeSubscriptionId, invoice.subscription as string),
          });

          if (dbSubscription) {
            // Add credits for the renewal period
            const proPlan = STRIPE_PLANS.pro;
            await db.update(users)
              .set({ 
                credits: proPlan.credits,
                updatedAt: new Date(),
              })
              .where(eq(users.id, dbSubscription.userId));

            // Record credit transaction for renewal
            await db.insert(creditTransactions).values({
              userId: dbSubscription.userId,
              amount: proPlan.credits,
              description: `Pro plan renewal - ${proPlan.credits} credits`,
              type: 'purchase',
              stripePaymentIntentId: invoice.payment_intent as string,
            });

            console.log('Credits added for subscription renewal');
          }
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