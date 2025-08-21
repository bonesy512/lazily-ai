# Lazily.AI: Stripe Webhook Agent Guide

**CRITICAL INSTRUCTIONS:** This `AGENTS.md` provides security-critical directives for the Stripe webhook handler. Failure to follow these rules can result in financial discrepancies and security vulnerabilities.

## 1. Core Responsibility

This endpoint's sole function is to **securely receive, verify, and process asynchronous events from Stripe**. It is the automated fulfillment center for all purchases.

## 2. Security & Reliability Directives

1.  **Verify Signature First:** The **very first action** in the `POST` handler **must** be to verify the `stripe-signature` header using `stripe.webhooks.constructEvent`. Any request that fails this verification must be immediately rejected with a `400` status code. Do not process the payload until the signature is verified.

2.  **Ensure Idempotency:** Webhooks can be sent more than once by Stripe. Your logic **must be idempotent** to prevent duplicate processing (e.g., awarding credits twice for one purchase). Before performing any action, check if the event has already been processed. For `checkout.session.completed` events, this is done by checking if the `session.id` already exists in our `creditPurchases` or subscription log table.

3.  **Acknowledge Events Immediately:** You **must** return a `200` status code to Stripe as quickly as possible to acknowledge that you have received the event. If you fail to do this, Stripe will consider the delivery a failure and will retry, potentially leading to duplicate events.

## 3. Architectural Pattern

* **Keep This Route Simple:** This `route.ts` file should act only as a secure "router."
* **Delegate Business Logic:** Once an event is verified and received, immediately delegate the actual business logic (like updating a database table) to a dedicated handler function in `lib/payments/stripe.ts` (e.g., `handleCreditPurchase`). This keeps the API route clean and separates concerns.