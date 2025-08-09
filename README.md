# Lazily.AI: The Effortless TREC Contract Engine

Lazily.AI is a specialized SaaS platform built to automate the generation of Texas Real Estate Commission (TREC) 1-4 Family Residential Contracts. Designed for real estate investors, wholesalers, and agents, it allows users to upload a CSV of property data and instantly generate hundreds of compliant, filled-out PDF contracts.

The platform utilizes a hybrid billing model: a low monthly subscription for access and a pay-as-you-go credit system for contract generation.

**Live Site: [https://lazily.ai](https://lazily.ai)**

## Key Features

- **CSV to PDF Automation:** Bulk generate TREC 1-4 contracts from a single spreadsheet upload.
- **Robust Data Validation:** Backend validation using Zod schemas to ensure CSV data integrity and contract compliance before generation.
- **Dynamic PDF Generation:** Utilizes `pdf-lib` to programmatically fill and flatten the official TREC PDF template.
- **Hybrid Payment Model:** Integrates Stripe for both recurring monthly subscriptions (`mode: 'subscription'`) and one-time credit pack purchases (`mode: 'payment'`).
- **Authentication & Teams:** Secure user accounts (JWT/cookies) with team management and role-based access (Owner/Member).
- **Dashboard:** Manage generated contracts, monitor available credits, upload CSVs, and handle billing via the Stripe Customer Portal.
- **Activity Logging:** System for tracking key user events (logins, purchases, contract generations).

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Database**: [Postgres](https://www.postgresql.org/) (e.g., Vercel Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Payments**: [Stripe](https://stripe.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/) & Tailwind CSS
- **Validation**: [Zod](https://zod.dev/)
- **CSV Parsing**: [Papa Parse](https://www.papaparse.com/)
- **PDF Manipulation**: [pdf-lib](https://pdf-lib.js.org/)

## Core Workflow

1.  **Upload:** The user uploads a CSV file matching the required template (`public/templates/lazily-ai-template.csv`).
2.  **Parse & Validate:** The backend parses the CSV (Papa Parse) and validates every row against a comprehensive Zod schema (`lib/contracts/validation.ts`).
3.  **Credit Check:** The system verifies the team has sufficient credits for the number of rows uploaded.
4.  **Persist Data:** Validated contract data is saved to the `contracts` table, and credits are deducted within a database transaction.
5.  **Generate (On-Demand):** When the user clicks "Download," the application retrieves the saved data and generates the PDF using `pdf-lib` and the TREC template (`lib/templates/TREC-20-18-automated-v1.pdf`).

## Key File Structure

- `lib/db/schema.ts`: Database schema (Users, Teams, Contracts, Credits) and relations.
- `lib/contracts/validation.ts`: The core Zod schema defining the required TREC 1-4 data structure.
- `lib/contracts/transformation.ts`: Logic for mapping raw CSV rows to the validated JSON structure.
- `app/(login)/actions.ts`: Contains the `processCsvFile` Server Action (handles upload, validation, credit deduction, and DB insertion).
- `app/(dashboard)/dashboard/contracts/actions.ts`: Contains the `generateContractAction` (handles PDF generation using `pdf-lib`).
- `app/api/stripe/webhook/route.ts`: Handles Stripe events (subscriptions and credit purchases).
- `lib/payments/stripe.ts`: Stripe API configuration and session creation logic.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone [YOUR_REPOSITORY_URL_HERE]
cd lazily-ai
pnpm install