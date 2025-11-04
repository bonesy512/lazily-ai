Lazily.AI: The Effortless TREC Contract Engine
Lazily.AI is a specialized SaaS platform built to automate the generation of Texas Real Estate Commission (TREC) 1-4 Family Residential Contracts. Designed for real estate investors, wholesalers, and agents, it allows users to quickly fill out a guided, questionnaire-style web form and instantly generate a single, compliant, filled-out PDF contract.

This strategic pivot prioritizes ease of use and error reduction over bulk processing, making the tool instantly accessible to all real estate professionals.

The platform utilizes a hybrid billing model: a low monthly subscription for access and a pay-as-you-go credit system for contract generation.

Live Site: https://lazily.ai

✨ Key Features (Updated for Single Form MVP)
Guided Web Form Entry: Generate contracts using an intuitive, step-by-step questionnaire with toggles and pre-populated defaults, significantly reducing manual data entry and errors.

Real-Time Data Validation: Input is validated in real-time against a comprehensive Zod schema to ensure data integrity and contract compliance before submission.

Dynamic PDF Generation: Utilizes pdf-lib to programmatically fill and flatten the official TREC PDF template, ensuring a perfect, ready-to-use document.

Hybrid Payment Model: Integrates Stripe for both recurring monthly subscriptions (mode: 'subscription') and one-time credit pack purchases (mode: 'payment').

Authentication & Teams: Secure user accounts (JWT/cookies) with team management and role-based access (Owner/Member).

Dashboard: Manage previously generated contracts, monitor available credits, access the contract creation form, and handle billing via the Stripe Customer Portal.

Activity Logging: System for tracking key user events (logins, purchases, contract generations).

💻 Tech Stack
Framework: Next.js (App Router, Server Actions)

Database: Postgres (e.g., Vercel Postgres)

ORM: Drizzle ORM

Payments: Stripe

UI Library: shadcn/ui & Tailwind CSS

Validation: Zod

PDF Manipulation: pdf-lib

(Removed Papa Parse as CSV is no longer the core input method)

🚀 Core Workflow
Input: The user fills out the guided, multi-step web form at /dashboard/contracts/create.

Submit & Validate: The form data is sent to a Server Action (handleSingleContractSubmission), where it undergoes comprehensive Zod validation.

Credit Check & Deduct: The system verifies the team has 1 credit available. The contract data is saved to the contracts table, and 1 credit is deducted within a single database transaction.

Generate & Download: The Server Action immediately retrieves the newly saved data and uses pdf-lib to generate the final, filled-out TREC PDF, which is then streamed back to the user for download.

📂 Key File Structure
lib/db/schema.ts: Database schema (Users, Teams, Contracts, Credits) and relations.

lib/contracts/validation.ts: The core Zod schema defining the required TREC 1-4 data structure.

~~lib/contracts/transformation.ts~~: (Obsolete - Removed) Logic for CSV-to-JSON mapping.

app/(dashboard)/dashboard/contracts/create/page.tsx: New primary entry point (The single web form UI).

app/(dashboard)/dashboard/contracts/actions.ts: Contains the crucial handleSingleContractSubmission (handles validation, credit deduction, DB insertion, and PDF generation).

app/api/stripe/webhook/route.ts: Handles Stripe events (subscriptions and credit top-ups).

lib/payments/stripe.ts: Stripe API configuration and session creation logic.

🛠️ Getting Started
Clone the repository and install dependencies:

Bash

git clone [YOUR_REPOSITORY_URL_HERE]
cd lazily-ai
pnpm install
