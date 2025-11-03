// ./app/(dashboard)/dashboard/contracts/actions.ts (FULL CODE SNIPPET - Adjust the import path if needed)

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
  // Type the user explicitly as UserWithTeamId to get teamId access
  const user: UserWithTeamId | null = await getUser(); 
  
  // The type error is fixed because `user` now *might* have `teamId`
  if (!user || !user.teamId) { 
    return { success: false, error: 'Not authenticated or team not found.' };
  }

  // 2. Data Validation (Server-side validation is crucial)
  const validationResult = Trec14Schema.safeParse(rawData);
  if (!validationResult.success) {
    console.error("Server-side validation failed:", validationResult.error.issues);
    return { 
        success: false, 
        error: 'Invalid contract data provided.',
        validationErrors: validationResult.error.issues
    };
  }

  const validatedData = validationResult.data;
  const REQUIRED_CREDITS = 1;
  let newContractId: number | null = null;

  try {
    // 3. Database Transaction (Credit Deduction and Insertion) - Atomic operation
    await db.transaction(async (tx) => {
        
      // 3a. Retrieve Team and Lock Row (FOR UPDATE)
      const [team] = await tx.select()
        .from(teams)
        .where(eq(teams.id, user.teamId!)) 
        .for('update'); // Locks the row for safety

      if (!team) {
        // This is a safety check; should not happen if user.teamId is present
        throw new Error('User team not found during transaction.');
      }

      // 3b. Check Credits (Assuming 'team.contractCredits' based on schema)
      if (team.contractCredits < REQUIRED_CREDITS) {
        throw new Error('Insufficient credits. Please purchase more credits to generate a contract.');
      }

      // 3c. Deduct Credits
      await tx.update(teams)
        .set({ contractCredits: sql`${teams.contractCredits} - ${REQUIRED_CREDITS}` })
        .where(eq(teams.id, team.id));

      // 3d. Insert Contract Data
      const [insertedContract] = await tx.insert(contracts).values({
        teamId: team.id,
        userId: user.id,
        contractName: validatedData.property.address || 'Unnamed Contract',
        contractData: validatedData as any, 
        status: 'generated',
      }).returning({ id: contracts.id });

      if (!insertedContract) {
        throw new Error('Failed to save contract data.');
      }
      newContractId = insertedContract.id;
    });

    if (!newContractId) {
        throw new Error('Transaction failed to return a new contract ID.');
    }

    // 4. Generate the PDF
    const pdfBytesUint8 = await generateContractAction(newContractId);

    // Convert Uint8Array to a serializable array of numbers
    const pdfBytesArray = Array.from(pdfBytesUint8);

    // Generate a safe filename
    const propertyIdentifier = validatedData.property?.address?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'contract';
    const buyerIdentifier = validatedData.parties?.buyer?.split(' ')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'buyer';
    const fileName = `TREC_1-4_${propertyIdentifier}_${buyerIdentifier}.pdf`;

    // 5. Finalization
    revalidatePath('/dashboard/contracts'); 
    revalidatePath('/dashboard/billing'); 

    return { success: true, pdfBytes: pdfBytesArray, fileName };

  } catch (error: unknown) {
    console.error("Error during single contract submission:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during contract processing.';
    
    // If PDF generation fails after DB commit, update the status
    if (newContractId) {
        await db.update(contracts)
            .set({ status: 'failed_generation' })
            .where(eq(contracts.id, newContractId)); 
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Existing PDF Generation Logic
 * Generates the PDF bytes for an existing contract record.
 */
export async function generateContractAction(contractId: number): Promise<Uint8Array> {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const contract = await db.query.contracts.findFirst({ 
    where: eq(contracts.id, contractId) 
  });
  
  if (!contract) throw new Error('Contract not found.');

  // Authorization check (Ensure user belongs to the team that owns the contract)
  if (user.teamId !== contract.teamId) {
    throw new Error('Unauthorized access to this contract.');
  }
  
  // Log the generation activity
  if (user.teamId) { // Check if teamId exists before logging
    await createActivityLog({
      teamId: user.teamId, // Use the teamId from the updated user object
      userId: user.id,
      action: ActivityType.CONTRACT_GENERATED,
    });
  }

  // ... (rest of the PDF generation logic remains the same)
  const data = contract.contractData as Trec14ContractData;

  // --- PDF-LIB Implementation ---
  try {
    const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
    const pdfTemplateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
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
    // ... (Your existing mapping logic here) ...
    // --- Parties ---
    fillText('parties.seller', data.parties?.seller);
    // ... (etc.) ...

    // --- Execution ---
    fillText('execution.day', data.execution?.day);
    fillText('execution.month', data.execution?.month);
    fillText('execution.year', data.execution?.year);

    form.flatten();
    return await pdfDoc.save();
 } catch (error) {
    console.error(`PDF Generation failed for contract ID ${contractId}:`, error);
    throw new Error('PDF generation process encountered an error.');
 }
}