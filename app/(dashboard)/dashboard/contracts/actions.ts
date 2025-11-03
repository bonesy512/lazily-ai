// File: ./app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
// Ensure getUser and createActivityLog are imported from the correct queries file
import { getUser, createActivityLog } from '@/lib/db/queries'; 
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
// NOTE: Trec14ContractData and Trec14Schema must be defined in your validation file
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
  const user = await getUser();
  // NOTE: This logic assumes 'user.teamId' is available from your getUser query.
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
        throw new Error('User team not found during transaction.');
      }

      // 3b. Check Credits (Ensure you use the correct column name, e.g., 'contractCredits' or 'credits')
      // Assuming 'team.credits' based on the robust logic used here.
      if (team.credits < REQUIRED_CREDITS) {
        throw new Error('Insufficient credits. Please purchase more credits to generate a contract.');
      }

      // 3c. Deduct Credits
      await tx.update(teams)
        .set({ credits: sql`${teams.credits} - ${REQUIRED_CREDITS}` })
        .where(eq(teams.id, team.id));

      // 3d. Insert Contract Data
      const [insertedContract] = await tx.insert(contracts).values({
        teamId: team.id,
        userId: user.id,
        // Use the property address as a recognizable name for the dashboard list
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
    revalidatePath('/dashboard/contracts'); // Refresh the contract list UI
    revalidatePath('/dashboard/billing'); // Refresh the credits counter

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
  await createActivityLog({
    teamId: contract.teamId,
    userId: user.id,
    action: ActivityType.CONTRACT_GENERATED,
  });

  
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
        // Only check the box if the value is explicitly true
        if (value === true) form.getCheckBox(fieldName).check(); 
        } catch (e) { /* Field not found, skip silently */ }
    };

    // --- MAPPING LOGIC (Condensed for brevity, assumes field names are correct) ---

    // --- Parties ---
    fillText('parties.seller', data.parties?.seller);
    fillText('parties.buyer', data.parties?.buyer);

    // --- Property ---
    fillText('property.lot', data.property?.lot);
    fillText('property.block', data.property?.block);
    fillText('property.addition', data.property?.addition);
    fillText('property.city', data.property?.city);
    fillText('property.county', data.property?.county);
    fillText('property.address', data.property?.address);
    fillText('property.exclusions.part1', data.property?.exclusions?.part1);
    fillText('property.exclusions.part2', data.property?.exclusions?.part2);
    
    const hoaStatus = data.property?.hoaStatus;
    if (hoaStatus === 'is_subject') check('property.hoaStatus.is_subject', true);
    else if (hoaStatus === 'not_subject') check('property.hoaStatus.not_subject', true);

    // --- Price ---
    fillText('price.cashPortion', data.price?.cashPortion);
    fillText('price.financeAmount', data.price?.financeAmount);
    fillText('price.salesPrice', data.price?.salesPrice);

    // --- Financing ---
    check('financing.thirdParty', data.financing?.thirdParty);
    check('financing.loanAssumption', data.financing?.loanAssumption);
    check('financing.seller', data.financing?.seller);

    // --- Leases ---
    check('leases.isResidential', data.leases?.isResidential);
    check('leases.isFixture', data.leases?.isFixture);
    check('leases.isNaturalResource', data.leases?.isNaturalResource);

    // --- Earnest Money ---
    fillText('earnestMoney.escrowAgentName', data.earnestMoney?.escrowAgentName);
    fillText('earnestMoney.escrowAgentAddress.part1', data.earnestMoney?.escrowAgentAddress?.part1);
    fillText('earnestMoney.amount', data.earnestMoney?.amount);
    fillText('earnestMoney.additionalAmount', data.earnestMoney?.additionalAmount);
    fillText('earnestMoney.additionalAmountDays', data.earnestMoney?.additionalAmountDays);

    // --- Option Fee ---
    fillText('optionFee.amount', data.optionFee?.amount);
    fillText('optionFee.days', data.optionFee?.days);

    // --- Title Policy ---
    fillText('titlePolicy.companyName', data.titlePolicy?.companyName);
    const titlePayer = data.titlePolicy?.payer;
    if (titlePayer === 'Seller') check('titlePolicy.payer.seller', true);
    else if (titlePayer === 'Buyer') check('titlePolicy.payer.buyer', true);

    const shortageStatus = data.titlePolicy?.shortageAmendment?.status;
    if (shortageStatus === 'shall_be_amended') check('titlePolicy.shortageAmendment.status.shall_be_amended', true);
    else if (shortageStatus === 'will_not_be_amended') check('titlePolicy.shortageAmendment.status.will_not_be_amended', true);

    const shortagePayer = data.titlePolicy?.shortageAmendment?.payer;
    if (shortagePayer === 'Seller') check('titlePolicy.shortageAmendment.payer.seller', true);
    else if (shortagePayer === 'Buyer') check('titlePolicy.shortageAmendment.payer.buyer', true);

    // --- Survey ---
    const surveyStatus = data.survey?.status;
    if (surveyStatus === "existing_survey_provided") check("survey.status.existing_survey_provided", true);
    else if (surveyStatus === "new_survey_ordered") check("survey.status.new_survey_ordered", true);
    else if (surveyStatus === "new_survey_by_seller") check("survey.status.new_survey_by_seller", true);

    fillText('survey.existing.deliveryDays', data.survey?.existing?.deliveryDays);
    const affidavitPayer = data.survey?.existing?.affidavitPayer;
    if (affidavitPayer === 'seller') check('survey.existing.affidavitPayer.seller', true);
    else if (affidavitPayer === 'buyer') check('survey.existing.affidavitPayer.buyer', true);

    // --- Objections ---
    fillText('objections.objectionDays', data.objections?.objectionDays);

    // --- Property Condition ---
    const disclosureStatus = data.propertyCondition?.sellerDisclosure?.status;
    if (disclosureStatus === 'received') check('propertyCondition.sellerDisclosure.status.received', true);
    else if (disclosureStatus === 'not_received') check('propertyCondition.sellerDisclosure.status.not_received', true);
    else if (disclosureStatus === 'not_required') check('propertyCondition.sellerDisclosure.status.not_required', true);
    
    fillText('propertyCondition.sellerDisclosure.deliveryDays', data.propertyCondition?.sellerDisclosure?.deliveryDays);

    const acceptanceStatus = data.propertyCondition?.acceptanceStatus;
    if (acceptanceStatus === 'as_is') check('propertyCondition.acceptanceStatus.as_is', true);
    else if (acceptanceStatus === 'as_is_with_repairs') check('propertyCondition.acceptanceStatus.as_is_with_repairs', true);

    fillText('propertyCondition.repairsList.part1', data.propertyCondition?.repairsList?.part1);

    // --- Brokers ---
    fillText('brokers.listing.associate.name', data.brokers?.listing?.associate?.name);
    fillText('brokers.listing.associate.licenseNo', data.brokers?.listing?.associate?.licenseNo);
    fillText('brokers.listing.firmName', data.brokers?.listing?.firmName);
    fillText('brokers.listing.firmLicenseNo', data.brokers?.listing?.firmLicenseNo);
    fillText('brokers.other.associate.name', data.brokers?.other?.associate?.name);
    fillText('brokers.other.associate.licenseNo', data.brokers?.other?.associate?.licenseNo);
    fillText('brokers.other.firmName', data.brokers?.other?.firmName);
    fillText('brokers.other.firmLicenseNo', data.brokers?.other?.firmLicenseNo);

    const listingRepresents = data.brokers?.listing?.represents;
    if (listingRepresents === 'seller_agent') check('brokers.listing.represents.seller_agent', true);
    else if (listingRepresents === 'intermediary') check('brokers.listing.represents.intermediary', true);

    const otherRepresents = data.brokers?.other?.represents;
    if (otherRepresents === 'buyer_agent') check('brokers.other.represents.buyer_agent', true);
    else if (otherRepresents === 'seller_subagent') check('brokers.other.represents.seller_subagent', true);

    // --- Closing ---
    fillText('closing.date.monthDay', data.closing?.date?.monthDay);
    fillText('closing.date.year', data.closing?.date?.year);

    // --- Possession ---
    const possessionStatus = data.possession?.status;
    if (possessionStatus === 'upon_closing') check('possession.status.upon_closing', true);
    else if (possessionStatus === 'temporary_lease') check('possession.status.temporary_lease', true);

    // --- Special Provisions ---
    fillText('specialProvisions.text', data.specialProvisions?.text);

    // --- Settlement ---
    fillText('settlement.sellerContributionToOther.amount', data.settlement?.sellerContributionToOther?.amount);

    // --- Notices ---
    fillText('notices.buyer.contactInfo.part1', data.notices?.buyer?.contactInfo?.part1);
    fillText('notices.seller.contactInfo.part1', data.notices?.seller?.contactInfo?.part1);

    // --- Addenda ---
    check('addenda.thirdPartyFinancing', data.addenda?.thirdPartyFinancing);
    check('addenda.sellerFinancing', data.addenda?.sellerFinancing);
    check('addenda.hoa', data.addenda?.hoa);
    check('addenda.buyersTemporaryLease', data.addenda?.buyersTemporaryLease);
    check('addenda.loanAssumption', data.addenda?.loanAssumption);
    check('addenda.saleOfOtherProperty', data.addenda?.saleOfOtherProperty);
    check('addenda.leadBasedPaint', data.addenda?.leadBasedPaint);
    check('addenda.sellersTemporaryLease', data.addenda?.sellersTemporaryLease);
    fillText('addenda.otherText.p1', data.addenda?.otherText?.p1);

    // --- Attorneys ---
    fillText('attorneys.buyer.name', data.attorneys?.buyer?.name);
    fillText('attorneys.buyer.phone', data.attorneys?.buyer?.phone);
    fillText('attorneys.buyer.email', data.attorneys?.buyer?.email);
    fillText('attorneys.seller.name', data.attorneys?.seller?.name);
    fillText('attorneys.seller.phone', data.attorneys?.seller?.phone);
    fillText('attorneys.seller.email', data.attorneys?.seller?.email);

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