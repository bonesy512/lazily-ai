# Lazily.AI: Stripe API Agent Guide

This `AGENTS.md` provides specific guidance for working within the `app/api/stripe` directory.

## 1. Core Responsibility

This module is responsible for the **secure and reliable processing of all payment-related events and API calls** via Stripe, supporting both recurring subscriptions and one-time credit purchases.

## 2. Key Files & Directives

*   **`webhook/route.ts`**:
    *   **Webhook security is CRITICAL.** Always verify the `stripe-signature` in the request header using `stripe.webhooks.constructEvent()` to ensure requests originate from Stripe [32, 33]. **Never bypass this verification.**
    *   **Implement idempotency** for all webhook event processing, especially for credit purchases. Check if a `stripeCheckoutSessionId` has already been processed before updating the database to prevent duplicate credit grants [28, 34].
    *   Differentiate between `session.mode === 'payment'` (for credits) and `session.mode === 'subscription'` (for platform access) to apply correct fulfillment logic [35, 36].
    *   Ensure appropriate HTTP status codes are returned (e.g., 200 OK for successful processing, 500 for internal errors that Stripe should retry) [37].

*   **`checkout/route.ts`**:
    *   Handles the post-checkout logic, including retrieving session details and updating team subscription status in the database [30, 38].

## 3. Development Workflow

*   **All Stripe-related API calls and webhook handling must use the official Stripe Node.js library** (`stripe`) [39, 40].
*   When creating checkout sessions (via `lib/payments/actions.ts`), **always include `client_reference_id` and `metadata`** to link the Stripe session back to the user and team in the application database [41, 42].
*   Be mindful of sensitive API keys and secrets. **Always use environment variables** (`process.env.STRIPE_SECRET_KEY`, `process.env.STRIPE_WEBHOOK_SECRET`) and never hardcode them [33, 39, 40].

