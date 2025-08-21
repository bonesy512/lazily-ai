import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team, ActivityType } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription,
  createActivityLog,
  getTeamOwner
} from '@/lib/db/queries';
import { db } from '../db/drizzle';
import { teams } from '../db/schema';
import { eq } from 'drizzle-orm';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

// This function is now updated to handle both 'subscription' and 'payment' modes
export async function createCheckoutSession({
  team,
  priceId,
  mode = 'subscription' // Default to 'subscription' for backward compatibility
}: {
  team: Team | null;
  priceId: string;
  mode?: 'subscription' | 'payment'; // Allow specifying the checkout mode
}) {
  const user = await getUser();
  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // Determine success URL based on checkout mode
  const successUrlPath = mode === 'subscription' 
    ? '/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}' 
    : '/dashboard/billing?success=true';
  
  const cancelUrlPath = mode === 'subscription' ? '/pricing' : '/dashboard/billing';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: mode, // Use the new 'mode' parameter
    success_url: `${process.env.BASE_URL}${successUrlPath}`,
    cancel_url: `${process.env.BASE_URL}${cancelUrlPath}`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();
  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id)
            }
          ]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  eventType: 'customer.subscription.updated' | 'customer.subscription.deleted'
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status
    });

    if (eventType === 'customer.subscription.updated') {
      const owner = await getTeamOwner(team.id);
      if (owner) {
        await createActivityLog({
          teamId: team.id,
          userId: owner.id,
          action: ActivityType.MEMBERSHIP_RENEWAL,
        });
      }
    }

  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status
    });
  }
}

export async function handleSubscriptionPurchase(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  const userId = parseInt(session.client_reference_id!);
  if (userId) {
      await createActivityLog({
        teamId: team.id,
        userId: userId,
        action: ActivityType.MEMBERSHIP_PURCHASE,
      });
  }
}

export async function handleCreditPurchase(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems.data[0].price?.id;

  // This is a simplified way to determine credits from price.
  // In a real application, you might have this mapping in your database or config.
  let creditsPurchased = 0;
  if (priceId === process.env.STRIPE_CREDITS_PRICE_ID_100) {
    creditsPurchased = 100;
  } else if (priceId === process.env.STRIPE_CREDITS_PRICE_ID_500) {
    creditsPurchased = 500;
  }

  if (creditsPurchased > 0) {
    await db.update(teams).set({
      contractCredits: (team.contractCredits || 0) + creditsPurchased
    }).where(eq(teams.id, team.id));

    const userId = parseInt(session.client_reference_id!);
    if (userId) {
      await createActivityLog({
        teamId: team.id,
        userId: userId,
        action: ActivityType.CREDIT_PURCHASE,
      });
    }
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });
  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });
  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}