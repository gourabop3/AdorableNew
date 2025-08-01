import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';
import { getUser } from '@/auth/stack-auth';
import { db } from '@/db';
import { users, subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();
    
    if (!plan || !STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selectedPlan = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];

    // Get or create user in our database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      // Create new user with 50 free credits
      dbUser = await db.insert(users).values({
        id: user.userId,
        email: user.email || '',
        name: user.name || '',
        image: user.image || '',
        credits: 50,
        plan: 'free',
      }).returning()[0];
    }

    // Create or get Stripe customer
    let customerId = dbUser.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
        metadata: {
          userId: dbUser.id,
        },
      });
      
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, dbUser.id));
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/billing?canceled=true`,
      metadata: {
        userId: dbUser.id,
        plan,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}