# Lazily.AI: Database Module Agent Guide

This `AGENTS.md` governs all work within the `lib/db` directory. Adherence to these rules is critical for maintaining data integrity.

## 1. Core Responsibility

This module is the **single source of truth for the application's data layer**. It defines all tables, columns, and relations using the Drizzle ORM.

## 2. Schema & Migrations Workflow

* **The `schema.ts` file is the master blueprint.** All changes to the database structure **must** be made here first.
* After modifying `schema.ts`, you **must** generate a new migration file by running the following command in your terminal:
    ```bash
    pnpm db:generate
    ```
* To apply the new migration to your local database, run:
    ```bash
    pnpm db:migrate
    ```
* **NEVER manually edit the SQL files** inside the `migrations/` directory. They are managed automatically by Drizzle Kit.

## 3. Querying Best Practices

* **Do not write raw SQL.** Use the Drizzle ORM query syntax for all database interactions.
* If you need to fetch data for a common use case (e.g., getting all contracts for a user's team), **first check `queries.ts` for an existing function**.
* If a suitable query function does not exist, **create a new, reusable function in `queries.ts`**. Do not place one-off, complex queries directly inside server actions or API routes. This keeps our data access patterns clean and centralized.