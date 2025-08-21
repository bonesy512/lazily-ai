# Lazily.AI: Contracts Module Agent Guide

This `AGENTS.md` provides specific guidance for working within the `lib/contracts` directory.

## 1. Core Responsibility

This module is critical for ensuring **data integrity and proper structuring** of all Texas Real Estate Commission (TREC) 1-4 Family Residential Contract data. It dictates how raw CSV data is interpreted, validated, and prepared for storage and PDF generation.

## 2. Key Files & Directives

*   **`validation.ts`**:
    *   **Always ensure all contract data conforms to the `Trec14Schema` defined here.** This is the **absolute single source of truth** for the contract data structure [6, 11, 19].
    *   When adding new contract fields or modifying existing ones, **first update the `Trec14Schema` in `validation.ts`**.
    *   All external data (e.g., from CSV uploads) **must be validated using this Zod schema** [9, 16, 20].

*   **`transformation.ts`**:
    *   This file contains the `mapCsvRowToJson` function, which is responsible for **meticulously mapping CSV column headers to the nested JSON structure** expected by `Trec14Schema` [7, 13, 17, 18, 21].
    *   If any CSV template columns change or new fields are added to the Zod schema, **you MUST update the mapping logic in `transformation.ts`** to correctly transform incoming CSV data [18, 21].
    *   Ensure that boolean values from CSV (e.g., 'true', 'yes', '1') are correctly converted to actual booleans using the `toBoolean` helper function [22].

## 3. Development Workflow

*   When working on features involving CSV uploads, data validation, or contract data persistence, **start by understanding the schema in `validation.ts` and the mapping in `transformation.ts`**.
*   **Prioritize type safety**: Leverage TypeScript to ensure consistency between CSV transformation, Zod validation, and database storage.

