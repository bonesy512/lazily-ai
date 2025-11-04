// ./app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
// 💡 FIX 2: Import the new UserWithTeamId type alongside the query functions
import { getUser, createActivityLog, UserWithTeamId } from '@/lib/db/queries'; 
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
 * Handles the submission of a single contract form.
 * Validates data, deducts credits, saves to DB, and generates the PDF.
 */
export async function handleSingleContractSubmission(rawData: Partial<Trec14ContractData>): Promise<SubmissionResult> {
  // 1. Authentication
  // Type the user explicitly as UserWithTeam...

  const user = await getUser();

  if (!user) {
    return { success: false, error: 'User not found or not authenticated.' };
  }

  // Ensure user has a teamId
  if (!user.teamId) {
    return { success: false, error: 'User is not assigned to a team.' };
  }

  // 2. Data Validation
  const validated = Trec14Schema.safeParse(rawData);

  if (!validated.success) {
    return { success: false, error: 'Validation failed.', validationErrors: validated.error.issues };
  }

  const validatedData = validated.data;

  let pdfDoc: PDFDocument; // Declare pdfDoc outside of try/catch so it's accessible

  // 3. Transaction for Credit Deduction and Contract Save
  try {
    const transactionResult = await db.transaction(async (tx) => {
      // 3a. Check for available credits
      const [team] = await tx.select().from(teams).where(eq(teams.id, user.teamId as number));

      if (!team) {
        throw new Error('Team not found for credit check.');
      }

      // Check if user has an active subscription (which grants unlimited contracts for now)
      // and only deduct for Free plan users
      if (team.subscriptionStatus !== 'active' && team.planName === 'Free') {
        if (team.contractCredits <= 0) {
          throw new Error('No contract credits available.');
        }
        
        // 3b. Deduct credit
        await tx.update(teams)
          .set({ contractCredits: sql`${teams.contractCredits} - 1` })
          .where(eq(teams.id, team.id));
      }

      // 3c. Log Activity
      await createActivityLog({
        teamId: team.id,
        userId: user.id,
        type: ActivityType.CONTRACT_GENERATED,
        details: `Generated new contract for property: ${validatedData.property.address || 'Unnamed Contract'}`,
      });

      // 3d. Insert Contract Data
      const [insertedContract] = await tx.insert(contracts).values({
        teamId: team.id,
        userId: user.id,
        // FIX: Removed 'contractName' property to resolve the Drizzle schema error.
        contractData: validatedData as any, 
        status: 'generated',
      }).returning({ id: contracts.id });

      if (!insertedContract) {
        throw new Error('Failed to insert contract record.');
      }

      return { teamId: team.id, contractId: insertedContract.id, validatedData };
    });

    const { validatedData } = transactionResult;
    
    // 4. PDF Generation (outside of main transaction)
    
    // This is the file name logic
    const fileName = `TREC_1-4_Contract_${validatedData.property.address ? validatedData.property.address.replace(/[^a-z0-9]/gi, '_') : 'Unnamed'}.pdf`;

    // 5. Build the PDF and return bytes
    const contractData = validatedData as Trec14ContractData;

    // --- PDF-LIB Implementation ---
    try {
      const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
      const pdfTemplateBytes = await fs.readFile(templatePath);
      pdfDoc = await PDFDocument.load(pdfTemplateBytes); // Assign to declared variable
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

      // --- MAPPING LOGIC (all your existing field mapping logic) ---

      // Example mapping from snippet:
      // --- Parties ---
      fillText('parties.seller', contractData.parties?.seller);
      // ... (etc.) ...

      // --- Execution ---
      fillText('execution.day', contractData.execution?.day);
      fillText('execution.month', contractData.execution?.month);
      fillText('execution.year', contractData.execution?.year);

      // The provided snippet ends with `form.flatten...` which I'll assume finishes the PDF process.
      form.flatten();
      
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred during PDF generation.';
        return { success: false, error: `PDF Generation Failed: ${error}` };
    }


    const pdfBytes = await pdfDoc.save();
    
    // Convert Uint8Array to number[] for serialization across the server boundary
    const serializedPdfBytes = Array.from(pdfBytes);

    revalidatePath('/dashboard/contracts');

    return {
      success: true,
      pdfBytes: serializedPdfBytes,
      fileName,
    };

  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred during the contract submission process.';
    return { success: false, error: `Transaction Failed: ${error}` };
  }
}