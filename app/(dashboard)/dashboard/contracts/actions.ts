// In /app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getUser, getUserWithTeam, createActivityLog } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { Trec14ContractData, Trec14Schema } from '@/lib/contracts/validation';
import { z } from 'zod';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function generateContractAction(contractId: number): Promise<Uint8Array> {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    throw new Error('Team not found for user.');
  }

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
  });

  if (!contract) {
    throw new Error('Contract not found.');
  }

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

  // --- Full PDF Field Mapping ---
  fillText('parties.seller', data.parties?.seller);
  fillText('parties.buyer', data.parties?.buyer);
  fillText('property.lot', data.property?.lot);
  fillText('property.block', data.property?.block);
  fillText('property.addition', data.property?.addition);
  fillText('property.city', data.property?.city);
  fillText('property.county', data.property?.county);
  fillText('property.address', data.property?.address);
  const hoaStatus = data.property?.hoaStatus;
  if (hoaStatus === 'is_subject') check('property.hoaStatus.is_subject', true);
  else if (hoaStatus === 'not_subject') check('property.hoaStatus.not_subject', true);
  fillText('price.cashPortion', data.price?.cashPortion);
  fillText('price.financeAmount', data.price?.financeAmount);
  fillText('price.salesPrice', data.price?.salesPrice);
  check('financing.thirdParty', data.financing?.thirdParty);
  check('financing.loanAssumption', data.financing?.loanAssumption);
  check('financing.seller', data.financing?.seller);
  const surveyStatus = data.survey?.status;
  if (surveyStatus === "existing_survey_provided") check("survey.status.existing_survey_provided", true);
  else if (surveyStatus === "new_survey_ordered") check("survey.status.new_survey_ordered", true);
  else if (surveyStatus === "new_survey_by_seller") check("survey.status.new_survey_by_seller", true);
  const affidavitPayer = data.survey?.existing?.affidavitPayer;
  if (affidavitPayer === 'seller') check('survey.existing.affidavitPayer.seller', true);
  else if (affidavitPayer === 'buyer') check('survey.existing.affidavitPayer.buyer', true);
  const disclosureStatus = data.propertyCondition?.sellerDisclosure?.status;
  if (disclosureStatus === 'received') check('propertyCondition.sellerDisclosure.status.received', true);
  else if (disclosureStatus === 'not_received') check('propertyCondition.sellerDisclosure.status.not_received', true);
  else if (disclosureStatus === 'not_required') check('propertyCondition.sellerDisclosure.status.not_required', true);
  const acceptanceStatus = data.propertyCondition?.acceptanceStatus;
  if (acceptanceStatus === 'as_is') check('propertyCondition.acceptanceStatus.as_is', true);
  else if (acceptanceStatus === 'as_is_with_repairs') check('propertyCondition.acceptanceStatus.as_is_with_repairs', true);
  const listingRepresents = data.brokers?.listing?.represents;
  if (listingRepresents === 'seller_agent') check('brokers.listing.represents.seller_agent', true);
  else if (listingRepresents === 'intermediary') check('brokers.listing.represents.intermediary', true);
  const otherRepresents = data.brokers?.other?.represents;
  if (otherRepresents === 'buyer_agent') check('brokers.other.represents.buyer_agent', true);
  else if (otherRepresents === 'seller_subagent') check('brokers.other.represents.seller_subagent', true);
  const possessionStatus = data.possession?.status;
  if (possessionStatus === 'upon_closing') check('possession.status.upon_closing', true);
  else if (possessionStatus === 'temporary_lease') check('possession.status.temporary_lease', true);
  fillText('specialProvisions.text', data.specialProvisions?.text);
  fillText('closing.date.monthDay', data.closing?.date?.monthDay);
  fillText('closing.date.year', data.closing?.date?.year);

  form.flatten();
  return await pdfDoc.save();
}

const singleContractFormSchema = z.object({
  seller: z.string().min(1, 'Seller name is required.'),
  buyer: z.string().min(1, 'Buyer name is required.'),
  andOrAssigns: z.enum(['on', 'off']).optional(),
});

export const handleSingleContractSubmission = validatedActionWithUser(
  singleContractFormSchema,
  // THIS LINE IS THE FIX: We now accept all three arguments
  async (data, _formData, user) => {
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return { error: 'Team not found for user.' };
    }

    const team = await db.query.teams.findFirst({ where: eq(teams.id, userWithTeam.teamId) });
    if (!team) {
      return { error: 'Team data could not be loaded.' };
    }

    if (team.contractCredits < 1) {
      return { error: 'You do not have enough credits to generate a contract.' };
    }

    const contractDataForDb: Trec14ContractData = {
      parties: {
        seller: data.seller,
        buyer: data.andOrAssigns === 'on' ? `${data.buyer} and/or assigns` : data.buyer,
      },
      property: { lot: null, block: null, addition: null, city: null, county: null, address: null, exclusions: { part1: null, part2: null }, hoaStatus: null, requiredNotices: null },
      price: { cashPortion: null, financeAmount: null, salesPrice: null },
      financing: { thirdParty: false, loanAssumption: false, seller: false },
      leases: { isResidential: false, isFixture: false, isNaturalResource: false, naturalResourceTerminationDays: null, naturalResourceDeliveryStatus: null },
      earnestMoney: { escrowAgentName: null, escrowAgentAddress: { part1: null, part2: null }, amount: null, additionalAmount: null, additionalAmountDays: null },
      optionFee: { amount: null, days: null },
      titlePolicy: { companyName: null, payer: null, shortageAmendment: { status: null, payer: null } },
      survey: { status: null, existing: { deliveryDays: null, affidavitPayer: null }, new: { deliveryDays: null }, newBySeller: { deliveryDays: null } },
      objections: { prohibitedUseActivity: null, objectionDays: null },
      propertyCondition: { sellerDisclosure: { status: null, deliveryDays: null }, acceptanceStatus: null, repairsList: { part1: null, part2: null } },
      serviceContract: { maxCost: null },
      brokers: { listing: { associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null }, represents: null, firmName: null, firmLicenseNo: null, supervisor: { name: null, licenseNo: null }, address: { street: null, city: null, state: null, zip: null, phone: null } }, other: { firmName: null, firmLicenseNo: null, represents: null, associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null }, supervisor: { name: null, licenseNo: null }, address: { street: null, city: null, state: null, zip: null, phone: null } }, disclosure: { fee: { dollarAmount: null, percentage: null, type: null } } },
      closing: { date: { monthDay: null, year: null } },
      possession: { status: null },
      specialProvisions: { text: null },
      settlement: { sellerContributionToBrokerage: { type: null, dollarAmount: null, percentage: null }, sellerContributionToOther: { amount: null } },
      notices: { buyer: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } }, seller: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } } },
      addenda: { thirdPartyFinancing: false, sellerFinancing: false, hoa: false, buyersTemporaryLease: false, loanAssumption: false, saleOfOtherProperty: false, mineralReservation: false, backupContract: false, coastalAreaProperty: false, hydrostaticTesting: false, lenderAppraisalTermination: false, environmentalAssessment: false, sellersTemporaryLease: false, shortSale: false, seawardOfGulfWaterway: false, leadBasedPaint: false, propaneGasSystem: false, residentialLeases: false, fixtureLeases: false, section1031Exchange: false, improvementDistrict: false, otherText: { p1: null } },
      attorneys: { buyer: { name: null, phone: null, fax: null, email: null }, seller: { name: null, phone: null, fax: null, email: null } },
      execution: { day: null, month: null, year: null },
    };

    try {
      await db.transaction(async (tx) => {
        await tx.update(teams).set({
          contractCredits: sql`${teams.contractCredits} - 1`
        }).where(eq(teams.id, userWithTeam.teamId!));

        await tx.insert(contracts).values({
          teamId: userWithTeam.teamId!,
          userId: user.id,
          contractData: contractDataForDb,
        });
      });
    } catch (e) {
      return { error: 'A database error occurred. Please try again.' };
    }

    revalidatePath('/dashboard/contracts');
    redirect('/dashboard/contracts');
  }
);