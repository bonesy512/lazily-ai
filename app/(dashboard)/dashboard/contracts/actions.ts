// app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams, Team } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUser, createActivityLog, getTeamForUser } from '@/lib/db/queries';
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
async function generateTrecPdf(
  contractData: Trec14ContractData
): Promise<number[]> {
  let pdfDoc: PDFDocument;
  const data = contractData; // Use a shorter alias for readability

  try {
    const templatePath = path.join(
      process.cwd(),
      'lib/templates/TREC-20-18-automated-v1.pdf'
    );
    const pdfTemplateBytes = await fs.readFile(templatePath);
    pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    const form = pdfDoc.getForm();

    // --- HELPER FUNCTIONS ---
    const fillText = (fieldName: string, value: string | null | undefined) => {
      try {
        if (value !== null && value !== undefined && value.trim() !== '')
          form.getTextField(fieldName).setText(value);
      } catch (e) {
        /* Field not found, skip silently */
      }
    };
    const check = (fieldName: string, value: boolean | null | undefined) => {
      try {
        if (value === true) form.getCheckBox(fieldName).check();
      } catch (e) {
        /* Field not found, skip silently */
      }
    };

    // --- COMPREHENSIVE MAPPING LOGIC ---
    // This is the complete mapping that was missing.

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
    if (hoaStatus === 'is_subject')
      check('property.hoaStatus.is_subject', true);
    else if (hoaStatus === 'not_subject')
      check('property.hoaStatus.not_subject', true);

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
    fillText(
      'earnestMoney.escrowAgentName',
      data.earnestMoney?.escrowAgentName
    );
    fillText(
      'earnestMoney.escrowAgentAddress.part1',
      data.earnestMoney?.escrowAgentAddress?.part1
    );
    fillText('earnestMoney.amount', data.earnestMoney?.amount);
    fillText(
      'earnestMoney.additionalAmount',
      data.earnestMoney?.additionalAmount
    );
    fillText(
      'earnestMoney.additionalAmountDays',
      data.earnestMoney?.additionalAmountDays
    );

    // --- Option Fee ---
    fillText('optionFee.amount', data.optionFee?.amount);
    fillText('optionFee.days', data.optionFee?.days);

    // --- Title Policy ---
    fillText('titlePolicy.companyName', data.titlePolicy?.companyName);
    const titlePayer = data.titlePolicy?.payer;
    if (titlePayer === 'Seller') check('titlePolicy.payer.seller', true);
    else if (titlePayer === 'Buyer') check('titlePolicy.payer.buyer', true);

    const shortageStatus = data.titlePolicy?.shortageAmendment?.status;
    if (shortageStatus === 'shall_be_amended')
      check('titlePolicy.shortageAmendment.status.shall_be_amended', true);
    else if (shortageStatus === 'will_not_be_amended')
      check('titlePolicy.shortageAmendment.status.will_not_be_amended', true);

    const shortagePayer = data.titlePolicy?.shortageAmendment?.payer;
    if (shortagePayer === 'Seller')
      check('titlePolicy.shortageAmendment.payer.seller', true);
    else if (shortagePayer === 'Buyer')
      check('titlePolicy.shortageAmendment.payer.buyer', true);

    // --- Survey ---
    const surveyStatus = data.survey?.status;
    if (surveyStatus === 'existing_survey_provided')
      check('survey.status.existing_survey_provided', true);
    else if (surveyStatus === 'new_survey_ordered')
      check('survey.status.new_survey_ordered', true);
    else if (surveyStatus === 'new_survey_by_seller')
      check('survey.status.new_survey_by_seller', true);

    fillText(
      'survey.existing.deliveryDays',
      data.survey?.existing?.deliveryDays
    );
    const affidavitPayer = data.survey?.existing?.affidavitPayer;
    if (affidavitPayer === 'seller')
      check('survey.existing.affidavitPayer.seller', true);
    else if (affidavitPayer === 'buyer')
      check('survey.existing.affidavitPayer.buyer', true);

    // --- Objections ---
    fillText('objections.objectionDays', data.objections?.objectionDays);

    // --- Property Condition ---
    const disclosureStatus = data.propertyCondition?.sellerDisclosure?.status;
    if (disclosureStatus === 'received')
      check('propertyCondition.sellerDisclosure.status.received', true);
    else if (disclosureStatus === 'not_received')
      check('propertyCondition.sellerDisclosure.status.not_received', true);
    else if (disclosureStatus === 'not_required')
      check('propertyCondition.sellerDisclosure.status.not_required', true);

    fillText(
      'propertyCondition.sellerDisclosure.deliveryDays',
      data.propertyCondition?.sellerDisclosure?.deliveryDays
    );

    const acceptanceStatus = data.propertyCondition?.acceptanceStatus;
    if (acceptanceStatus === 'as_is')
      check('propertyCondition.acceptanceStatus.as_is', true);
    else if (acceptanceStatus === 'as_is_with_repairs')
      check('propertyCondition.acceptanceStatus.as_is_with_repairs', true);

    fillText(
      'propertyCondition.repairsList.part1',
      data.propertyCondition?.repairsList?.part1
    );

    // --- Brokers ---
    fillText(
      'brokers.listing.associate.name',
      data.brokers?.listing?.associate?.name
    );
    fillText(
      'brokers.listing.associate.licenseNo',
      data.brokers?.listing?.associate?.licenseNo
    );
    fillText('brokers.listing.firmName', data.brokers?.listing?.firmName);
    fillText(
      'brokers.listing.firmLicenseNo',
      data.brokers?.listing?.firmLicenseNo
    );
    fillText(
      'brokers.other.associate.name',
      data.brokers?.other?.associate?.name
    );
    fillText(
      'brokers.other.associate.licenseNo',
      data.brokers?.other?.associate?.licenseNo
    );
    fillText('brokers.other.firmName', data.brokers?.other?.firmName);
    fillText(
      'brokers.other.firmLicenseNo',
      data.brokers?.other?.firmLicenseNo
    );

    const listingRepresents = data.brokers?.listing?.represents;
    if (listingRepresents === 'seller_agent')
      check('brokers.listing.represents.seller_agent', true);
    else if (listingRepresents === 'intermediary')
      check('brokers.listing.represents.intermediary', true);

    const otherRepresents = data.brokers?.other?.represents;
    if (otherRepresents === 'buyer_agent')
      check('brokers.other.represents.buyer_agent', true);
    else if (otherRepresents === 'seller_subagent')
      check('brokers.other.represents.seller_subagent', true);

    // --- Closing ---
    fillText('closing.date.monthDay', data.closing?.date?.monthDay);
    fillText('closing.date.year', data.closing?.date?.year);

    // --- Possession ---
    const possessionStatus = data.possession?.status;
    if (possessionStatus === 'upon_closing')
      check('possession.status.upon_closing', true);
    else if (possessionStatus === 'temporary_lease')
      check('possession.status.temporary_lease', true);

    // --- Special Provisions ---
    fillText('specialProvisions.text', data.specialProvisions?.text);

    // --- Settlement ---
    fillText(
      'settlement.sellerContributionToOther.amount',
      data.settlement?.sellerContributionToOther?.amount
    );

    // --- Notices ---
    fillText(
      'notices.buyer.contactInfo.part1',
      data.notices?.buyer?.contactInfo?.part1
    );
    fillText(
      'notices.seller.contactInfo.part1',
      data.notices?.seller?.contactInfo?.part1
    );

    // --- Addenda ---
    check('addenda.thirdPartyFinancing', data.addenda?.thirdPartyFinancing);
    check('addenda.sellerFinancing', data.addenda?.sellerFinancing);
    check('addenda.hoa', data.addenda?.hoa);
    check(
      'addenda.buyersTemporaryLease',
      data.addenda?.buyersTemporaryLease
    );
    check('addenda.loanAssumption', data.addenda?.loanAssumption);
    check('addenda.saleOfOtherProperty', data.addenda?.saleOfOtherProperty);
    check('addenda.leadBasedPaint', data.addenda?.leadBasedPaint);
    check(
      'addenda.sellersTemporaryLease',
      data.addenda?.sellersTemporaryLease
    );
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

    // --- Finalization ---
    form.flatten();
  } catch (e) {
    const error =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during PDF generation.';
    throw new Error(`PDF Generation Failed: ${error}`);
  }

  const pdfBytes = await pdfDoc.save();
  return Array.from(pdfBytes);
}

/**
 * SERVER ACTION: Handles the submission of a new single contract form (CREATE).
 * Validates data, deducts credits, saves to DB, and generates the PDF.
 */
export async function handleSingleContractSubmission(
  rawData: Partial<Trec14ContractData>
): Promise<SubmissionResult> {
  const user = await getUser();
  if (!user || !user.teamId) {
    return {
      success: false,
      error: user ? 'User is not assigned to a team.' : 'User not authenticated.',
    };
  }

  // 1. Data Validation
  const validated = Trec14Schema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      error: 'Validation failed.',
      validationErrors: validated.error.issues,
    };
  }

  const validatedData = validated.data;
  let team: Team | null = null;

  // 2. Transaction for Credit Deduction and Contract Save
  try {
    const transactionResult = await db.transaction(async (tx) => {
      // Get the team and lock the row for the update
      const [teamData] = await tx
        .select()
        .from(teams)
        .where(eq(teams.id, user.teamId as number))
        .for('update'); // Lock the team row

      if (!teamData) throw new Error('Team not found for credit check.');
      team = teamData; // Assign to outer scope for activity logging

      // Check for available credits
      if (team.contractCredits <= 0) {
        throw new Error(
          'No contract credits available. Please purchase more on the billing page.'
        );
      }

      // Deduct 1 credit
      await tx
        .update(teams)
        .set({ contractCredits: sql`${teams.contractCredits} - 1` })
        .where(eq(teams.id, team.id));

      // Insert Contract Data
      const [insertedContract] = await tx
        .insert(contracts)
        .values({
          teamId: team.id,
          userId: user.id,
          contractData: validatedData as any,
          status: 'generated',
        })
        .returning({ id: contracts.id });

      if (!insertedContract)
        throw new Error('Failed to insert contract record.');

      return { contractData: validatedData };
    });

    const { contractData } = transactionResult; 

    // 3. Log Activity (Do this *after* the transaction succeeds)
    if (team) {
      await createActivityLog({
        teamId: team.id,
        userId: user.id,
        action: ActivityType.CONTRACT_GENERATED,
      });
    }

    // 4. PDF Generation (using the refactored utility)
    const pdfBytes = await generateTrecPdf(contractData);

    // 5. File name logic
    const safeAddress = contractData.property.address
      ? contractData.property.address.replace(/[^a-z0-9]/gi, '_')
      : 'Unnamed';
    const fileName = `TREC_1-4_Contract_${safeAddress}.pdf`;

    revalidatePath('/dashboard/contracts');
    revalidatePath('/dashboard/billing'); // Revalidate credits
    return {
      success: true,
      pdfBytes: Array.from(pdfBytes),
      fileName,
    };
  } catch (e) {
    const error =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during the contract submission process.';
    return { success: false, error: `Transaction Failed: ${error}` };
  }
}

/**
 * SERVER ACTION: Downloads an ALREADY GENERATED contract (READ).
 * Fetches saved data and regenerates the PDF on demand.
 * @param contractId The ID of the contract to download.
 * @returns A promise that resolves to the PDF file content as an array of bytes.
 */
export async function downloadExistingContract(
  contractId: number
): Promise<number[]> {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated.');
  }

  // 1. Fetch Contract Data
  const [contractRecord] = await db
    .select()
    .from(contracts)
    .where(eq(contracts.id, contractId))
    .limit(1);

  if (!contractRecord) {
    throw new Error(`Contract with ID ${contractId} not found.`);
  }

  // 2. Security Check (Ensure user belongs to the contract's team)
  if (user.teamId !== contractRecord.teamId) {
    throw new Error('Access denied. Contract does not belong to your team.');
  }

  // 3. Regenerate PDF from stored data using the utility function
  const contractData = Trec14Schema.parse(contractRecord.contractData);
  const pdfBytes = await generateTrecPdf(contractData);

  return Array.from(pdfBytes);
}