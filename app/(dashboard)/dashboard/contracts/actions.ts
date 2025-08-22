// In /app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser, getUserWithTeam, createActivityLog } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { Trec14ContractData } from '@/lib/contracts/validation';

export async function generateContractAction(contractId: number): Promise<Uint8Array> {
  // First, get the basic user object
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Next, use the user's id to get their team information
  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error('Team not found for user.');
  }

  // Now we can safely use the teamId
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
  });

  if (!contract) {
    throw new Error('Contract not found.');
  }

  // Log the activity using the verified teamId
  await createActivityLog({
    teamId: userWithTeam.teamId,
    userId: user.id,
    action: ActivityType.CONTRACT_GENERATED,
  });

  const data = contract.contractData as Trec14ContractData;

  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  const fillText = (fieldName: string, value: string | null | undefined) => {
    try {
      if (value !== null && value !== undefined) form.getTextField(fieldName).setText(value);
    } catch (e) { console.log(`Could not find TextField: ${fieldName}`); }
  };
  const check = (fieldName: string, value: boolean | null | undefined) => {
    try {
      if (value) form.getCheckBox(fieldName).check();
    } catch (e) { console.log(`Could not find CheckBox: ${fieldName}`); }
  };

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

  // --- Survey ---
  const surveyStatus = data.survey?.status;
  if (surveyStatus === "existing_survey_provided") check("survey.status.existing_survey_provided", true);
  else if (surveyStatus === "new_survey_ordered") check("survey.status.new_survey_ordered", true);
  else if (surveyStatus === "new_survey_by_seller") check("survey.status.new_survey_by_seller", true);

  const affidavitPayer = data.survey?.existing?.affidavitPayer;
  if (affidavitPayer === 'seller') check('survey.existing.affidavitPayer.seller', true);
  else if (affidavitPayer === 'buyer') check('survey.existing.affidavitPayer.buyer', true);

  // --- Property Condition ---
  const disclosureStatus = data.propertyCondition?.sellerDisclosure?.status;
  if (disclosureStatus === 'received') check('propertyCondition.sellerDisclosure.status.received', true);
  else if (disclosureStatus === 'not_received') check('propertyCondition.sellerDisclosure.status.not_received', true);
  else if (disclosureStatus === 'not_required') check('propertyCondition.sellerDisclosure.status.not_required', true);

  const acceptanceStatus = data.propertyCondition?.acceptanceStatus;
  if (acceptanceStatus === 'as_is') check('propertyCondition.acceptanceStatus.as_is', true);
  else if (acceptanceStatus === 'as_is_with_repairs') check('propertyCondition.acceptanceStatus.as_is_with_repairs', true);

  // --- Brokers ---
  const listingRepresents = data.brokers?.listing?.represents;
  if (listingRepresents === 'seller_agent') check('brokers.listing.represents.seller_agent', true);
  else if (listingRepresents === 'intermediary') check('brokers.listing.represents.intermediary', true);

  const otherRepresents = data.brokers?.other?.represents;
  if (otherRepresents === 'buyer_agent') check('brokers.other.represents.buyer_agent', true);
  else if (otherRepresents === 'seller_subagent') check('brokers.other.represents.seller_subagent', true);

  // --- Possession ---
  const possessionStatus = data.possession?.status;
  if (possessionStatus === 'upon_closing') check('possession.status.upon_closing', true);
  else if (possessionStatus === 'temporary_lease') check('possession.status.temporary_lease', true);

  // ... other text and checkbox fields ...
  fillText('specialProvisions.text', data.specialProvisions?.text);
  fillText('closing.date.monthDay', data.closing?.date?.monthDay);
  fillText('closing.date.year', data.closing?.date?.year);

  form.flatten();
  return await pdfDoc.save();
}