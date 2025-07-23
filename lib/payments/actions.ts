'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';

export const checkoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  // This action is for subscriptions, so we don't specify a mode.
  await createCheckoutSession({ team: team, priceId });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});

// New action for handling one-time credit purchases
export const creditCheckoutAction = withTeam(async (formData, team) => {
  const priceId = formData.get('priceId') as string;
  // We specify 'payment' mode for a one-time purchase
  await createCheckoutSession({ team: team, priceId, mode: 'payment' });
});