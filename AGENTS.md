# Lazily.AI Agent Guide

This document provides guidance for AI agents working on the Lazily.AI codebase.

## 1. Project Overview

Lazily.AI is a SaaS platform designed to automate the generation of Texas Real Estate Commission (TREC) 1-4 Family Residential Contracts. It allows real estate professionals to upload a CSV file with property data and receive filled-out, compliant PDF contracts.

The platform uses a hybrid billing model with a monthly subscription for access and a pay-as-you-go credit system for generating contracts.

**Core Workflow:**

1.  **Upload CSV:** User uploads a CSV file (`public/templates/lazily-ai-template.csv`).
2.  **Parse & Validate:** The backend parses the CSV and validates each row against a Zod schema.
3.  **Credit Check:** The system verifies the user's team has enough credits.
4.  **Save Data:** Valid contract data is stored in the database, and credits are deducted.
5.  **Generate PDF:** When the user requests a download, the system generates the PDF using `pdf-lib`.

## 2. Tech Stack & Key Libraries

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Database:** [Postgres](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Payments:** [Stripe](https://stripe.com/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) & Tailwind CSS
- **Validation:** [Zod](https://zod.dev/)
- **CSV Parsing:** [Papa Parse](https://www.papaparse.com/)
- **PDF Manipulation:** [pdf-lib](https://pdf-lib.js.org/)
- **Authentication:** JWT/cookies using `jose`.

## 3. Core Concepts

### Data Validation

The single source of truth for contract data structure is the Zod schema located in `lib/contracts/validation.ts`. All data from the uploaded CSV must be transformed and validated against this schema before being saved to the database.

### Payment System

- **Subscriptions:** Managed by Stripe (`mode: 'subscription'`). Grants access to the platform.
- **Credits:** One-time purchases managed by Stripe (`mode: 'payment'`). Used to generate contracts.
- **Stripe Webhooks:** The endpoint at `app/api/stripe/webhook/route.ts` handles events from Stripe to update subscription statuses and credit balances.

### Server Actions

The application uses Next.js Server Actions for most backend operations that are initiated from the client. This keeps client-side JavaScript minimal and colocates data mutations with the components that use them.

## 4. Key File Structure

- `AGENTS.md`: This file. Your guide to the repository.
- `README.md`: Public-facing project information.
- `package.json`: Project scripts and dependencies.
- `next.config.ts`: Next.js configuration.
- `drizzle.config.ts`: Drizzle ORM configuration.
- `lib/db/schema.ts`: The complete database schema defined with Drizzle ORM.
- `lib/contracts/validation.ts`: The master Zod schema for TREC contract data.
- `lib/contracts/transformation.ts`: Logic for mapping CSV rows to the structure defined by the Zod schema.
- `app/(login)/actions.ts`: Contains the `processCsvFile` Server Action, which is the entry point for the core CSV processing workflow.
- `app/(dashboard)/dashboard/contracts/actions.ts`: Contains the `generateContractAction` for creating the PDF on demand.
- `app/api/stripe/webhook/route.ts`: Handles all incoming Stripe webhooks for payments and subscriptions.

## 5. Development Workflow

### Getting Started

1.  Clone the repository.
2.  Install dependencies using pnpm:
    ```bash
    pnpm install
    ```
3.  Set up your local environment variables by creating a `.env.local` file. You will need credentials for your local Postgres database and Stripe.
4.  Run the development server:
    ```bash
    pnpm dev
    ```

### Database

- **Schema:** The database schema is defined in `lib/db/schema.ts`.
- **Migrations:** To generate a new migration after changing the schema, run:
  ```bash
  pnpm db:generate
  ```
- **Applying Migrations:** To apply migrations to your database, run:
  ```bash
  pnpm db:migrate
  ```
- **Seeding:** To seed the database with initial data, run:
  ```bash
  pnpm db:seed
  ```
- **Database Studio:** To view and manage your database with a GUI, run:
  ```bash
  pnpm db:studio
  ```

## 6. Coding Conventions

- **Use Server Actions:** For any backend logic triggered by user interaction (e.g., form submissions), prefer Next.js Server Actions over traditional API routes.
- **Validate with Zod:** All external data (e.g., from CSV uploads or user input) must be validated using a Zod schema.
- **Use Drizzle ORM:** All database queries should be made using the Drizzle ORM. Refer to the schema in `lib/db/schema.ts` and existing queries in `lib/db/queries.ts`.
- **Follow Existing Patterns:** When adding new features, look for existing implementations of similar features in the codebase and follow the established patterns.
- **Keep UI and Logic Separate:** UI components are in `components/`. Business logic is primarily in `lib/` and `app/` (within actions and routes).
