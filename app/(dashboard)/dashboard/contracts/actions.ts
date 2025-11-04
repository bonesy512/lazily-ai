'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUser, createActivityLog } from '@/lib/db/queries'; 
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { Trec14ContractData, Trec14Schema } from '@/lib/contracts/validation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Define the return type for the new submission handler
type SubmissionResult = {
    success: true;
    pdfBytes: number[]; // Serialized Uint8Array
    fileName: string;
} | {
    success: false;
    error: string;
    validationErrors?: z.ZodIssue[];
};

/**
 * CORE UTILITY: Generates a TREC 1-4 Family Contract PDF from validated data.
 * @param contractData The validated contract form data.
 * @returns A promise that resolves to the PDF file content as an array of bytes.
 */
async function generateTrecPdf(contractData: Trec14ContractData): Promise<number[]> {
  let pdfDoc: PDFDocument;

  try {
    const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
    const pdfTemplateBytes = await fs.readFile(templatePath);
    pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    const form = pdfDoc.getForm();
    
    const fillText = (fieldName: string, value: string | null | undefined) => {
        try {
        if (value !== null && value !== undefined && value.trim() !== '') form.getTextField(fieldName).setText(value);
        } catch (e) { /* Field not found, skip silently */ }
    };

    const check = (fieldName: string, value: boolean | null | undefined) => {
        try {
        if (value === true) form.getCheckBox(fieldName).check(); 
        } catch (e) { /* Field not found, skip silently */ }
    };

    // --- MAPPING LOGIC (Your existing field mapping logic) ---
    // Example mapping:
    // --- Parties ---
    fillText('parties.seller', contractData.parties?.seller);
    // ... (etc.) ...

    // --- Execution ---
    fillText('execution.day', contractData.execution?.day);
    fillText('execution.month', contractData.execution?.month);
    fillText('execution.year', contractData.execution?.year);

    // Assuming form.flatten() is the final step
    form.flatten();
    
  } catch (e) {
      const error = e instanceof Error ? e.message : 'An unknown error occurred during PDF generation.';
      throw new Error(`PDF Generation Failed: ${error}`);
  }

  const pdfBytes = await pdfDoc.save();
  return Array.from(pdfBytes);
}


/**
 * SERVER ACTION: Handles the submission of a new single contract form (CREATE).
 * Validates data, deducts credits, saves to DB, and generates the PDF.
 */
export async function handleSingleContractSubmission(rawData: Partial<Trec14ContractData>): Promise<SubmissionResult> {
  const user = await getUser();

  if (!user || !user.teamId) {
    return { success: false, error: user ? 'User is not assigned to a team.' : 'User not authenticated.' };
  }

  // 1. Data Validation
  const validated = Trec14Schema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: 'Validation failed.', validationErrors: validated.error.issues };
  }

  const validatedData = validated.data;
  
  // 2. Transaction for Credit Deduction and Contract Save
  try {
    const transactionResult = await db.transaction(async (tx) => {
      // Check for available credits and deduct if necessary (Free plan)
      const [team] = await tx.select().from(teams).where(eq(teams.id, user.teamId as number));

      if (!team) throw new Error('Team not found for credit check.');

      if (team.subscriptionStatus !== 'active' && team.planName === 'Free') {
        if (team.contractCredits <= 0) throw new Error('No contract credits available.');
        
        await tx.update(teams)
          .set({ contractCredits: sql`${teams.contractCredits} - 1` })
          .where(eq(teams.id, team.id));
      }

      // Log Activity (FIX: Removed 'details' property as it is not present in the expected type)
      await createActivityLog({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.CONTRACT_GENERATED, 
        // details property was removed here
      });

      // Insert Contract Data (Fixed Drizzle Error)
      const [insertedContract] = await tx.insert(contracts).values({
        teamId: team.id,
        userId: user.id,
        contractData: validatedData as any, 
        status: 'generated',
      }).returning({ id: contracts.id });

      if (!insertedContract) throw new Error('Failed to insert contract record.');

      return { contractData: validatedData };
    });

    const { contractData } = transactionResult;
    
    // 3. PDF Generation (using the refactored utility)
    const pdfBytes = await generateTrecPdf(contractData);
    
    // 4. File name logic
    const fileName = `TREC_1-4_Contract_${contractData.property.address ? contractData.property.address.replace(/[^a-z0-9]/gi, '_') : 'Unnamed'}.pdf`;

    revalidatePath('/dashboard/contracts');

    return {
      success: true,
      pdfBytes: Array.from(pdfBytes),
      fileName,
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred during the contract submission process.';
    return { success: false, error: `Transaction Failed: ${error}` };
  }
}


/**
 * SERVER ACTION: Downloads an ALREADY GENERATED contract (READ).
 * Fetches saved data and regenerates the PDF on demand.
 * @param contractId The ID of the contract to download.
 * @returns A promise that resolves to the PDF file content as an array of bytes.
 */
export async function downloadExistingContract(contractId: number): Promise<number[]> {
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated.');
  }

  // 1. Fetch Contract Data
  const [contractRecord] = await db.select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contractRecord) {
    throw new Error(`Contract with ID ${contractId} not found.`);
  }

  // 2. Security Check (Ensure user belongs to the contract's team)
  if (user.teamId !== contractRecord.teamId) {
      throw new Error("Access denied. Contract does not belong to your team.");
  }
  
  // 3. Regenerate PDF from stored data using the utility function
  // Note: contractData is stored as JSON in the database and needs to match the Trec14Schema type
  const contractData = Trec14Schema.parse(contractRecord.contractData);
  const pdfBytes = await generateTrecPdf(contractData);

  return Array.from(pdfBytes);
}