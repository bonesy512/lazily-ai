'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { createActionWithTeam } from '@/lib/auth/action-helpers';

// -----------------------------------------------------------
// 1. Subscription Checkout Action (Original)
// -----------------------------------------------------------
// Used for initiating a new subscription.
export const checkoutAction = createActionWithTeam(async (formData, team) => {
    const priceId = formData.get('priceId') as string;
    // Mode is omitted or defaults to 'subscription' for a recurring plan.
    await createCheckoutSession({ team: team, priceId });
});

// -----------------------------------------------------------
// 2. Customer Portal Action
// -----------------------------------------------------------
// Used for managing an existing subscription.
export const customerPortalAction = createActionWithTeam(async (_, team) => {
    const portalSession = await createCustomerPortalSession(team);
    redirect(portalSession.url);
});

// -----------------------------------------------------------
// 3. One-Time Credit Purchase Action (FIXED NAME)
// -----------------------------------------------------------
// New action for handling one-time credit purchases.
// Renamed to 'creditCheckoutAction' to match the billing page usage.
export const creditCheckoutAction = createActionWithTeam(async (formData, team) => {
    const priceId = formData.get('priceId') as string;
    // We specify 'payment' mode for a one-time purchase.
    await createCheckoutSession({ team: team, priceId, mode: 'payment' });
});

// -----------------------------------------------------------
// ❌ REMOVED: The following block was redundant and incorrect:
/*
function withTeam(arg0: (formData: any, team: any) => Promise<void>) {
    throw new Error('Function not implemented.');
}
*/