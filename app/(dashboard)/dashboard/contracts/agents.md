# Lazily.AI: Dashboard Contracts Agent Guide

This `AGENTS.md` provides specific guidance for working within the `app/(dashboard)/dashboard/contracts` directory.

## 1. Core Responsibility

This module is the user's primary workspace for **uploading CSVs to generate contracts and downloading the resulting TREC 1-4 PDF files**. It integrates the front-end user experience with the core backend contract generation logic.

## 2. Key Files & Directives

*   **`actions.ts` (specifically `generateContractAction`)**:
    *   This server action is responsible for **filling the TREC 1-4 PDF template using `pdf-lib`** [46, 49, 50].
    *   **Ensure every field defined in `Trec14Schema` is mapped and filled** within this action, using `fillText` for text fields and `check` for checkboxes [50-65]. Refer to `lib/contracts/validation.ts` for the data structure and `inspect-pdf.mjs` for PDF field names [19, 66-68].
    *   After filling, **always call `form.flatten()`** to make the PDF non-editable and ensure consistent appearance across viewers [44, 69].
    *   Ensure **activity logging** for `CONTRACT_GENERATED` is correctly implemented for each generation [67, 70].

*   **`page.tsx`**:
    *   This page orchestrates the display of `CsvUploadForm` and `ContractList` [44, 45].
    *   Ensure `CreditsCounter` and `CreditRefresher` components are properly integrated to provide up-to-date credit balance information [45, 71, 72].

*   **`components/dashboard/DownloadContractButton.tsx`**:
    *   This client component triggers the `generateContractAction` on the server [73].
    *   It handles the client-side download of the generated PDF bytes received from the server action [74].

## 3. Development Workflow

*   When updating the PDF template (`lib/templates/TREC-20-18-automated-v1.pdf`), **verify that all field names used in `generateContractAction` still match** the new template [75]. If field names change, update the `actions.ts` accordingly.
*   The `processCsvFile` action (located in `app/(login)/actions.ts`) is responsible for saving the raw contract data and deducting credits [7, 14, 27, 76, 77]. This directory's `actions.ts` focuses only on generating the PDF from *already saved* data.
