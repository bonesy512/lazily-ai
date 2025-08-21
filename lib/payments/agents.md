# Lazily.AI: Payments Module Agent Guide

This `AGENTS.md` provides strict guidance for working within the `lib/payments` directory. This is a high-security area of the application.

## 1. Core Responsibility

This module's sole responsibility is to **securely manage all interactions with the Stripe API**. This includes initiating payments and handling the logic for what happens after a payment is confirmed via webhook.

## 2. Security & Best Practices

* **NEVER hardcode secrets.** All Stripe API keys and secrets **must** be accessed from environment variables (`process.env`).
* When creating a Stripe Checkout Session (`createCheckoutSession`), you **must** pass the `user.id` as the `client_reference_id` and the `team.id` in the `metadata`. This is critical for linking the Stripe transaction back to our database records during webhook processing.
* All business logic for fulfilling a purchase (e.g., updating a team's credit balance or subscription status) belongs in the handler functions within `stripe.ts` (e.g., `handleCreditPurchase`, `handleSubscriptionChange`).

## 3. Key File Directives

* **`stripe.ts`**:
    * This is the **only file** that should directly interact with the Stripe Node.js client.
    * The `createCheckoutSession` function must clearly differentiate between `mode: 'subscription'` for recurring plans and `mode: 'payment'` for one-time credit purchases. The success and cancel URLs should be appropriate for each mode.
* **`actions.ts`**:
    * These server actions are the bridge from the UI to the payment logic.
    * They should be simple wrappers that extract the `priceId` from the form data and call `createCheckoutSession` with the correct parameters.
    * Do not place any complex business logic within these actions; delegate it to the functions in `stripe.ts`.