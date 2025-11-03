'use server';

import { db } from '@/lib/db/drizzle';
import { contracts, ActivityType, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser, createActivityLog, getTeamForUser } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { revalidatePath } from 'next/cache';

export async function generateContractAction(contractId: number): Promise<Uint8Array> {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');
  const contract = await db.query.contracts.findFirst({ where: eq(contracts.id, contractId) });
  if (!contract) throw new Error('Contract not found.');
  const team = await getTeamForUser();
  if (team) { await createActivityLog({ teamId: team.id, userId: user.id, action: ActivityType.CONTRACT_GENERATED }); }
  
  const data = contract.contractData as Trec14ContractData;
  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  const fillText = (fieldName: string, value: string | null | undefined) => { try { if (value !== null && value !== undefined && value !== '') form.getTextField(fieldName).setText(value); } catch (e) { console.warn(`PDF Warning: Could not find TextField: ${fieldName}`); } };
  const check = (fieldName: string) => { try { form.getCheckBox(fieldName).check(); } catch (e) { console.warn(`PDF Warning: Could not find CheckBox: ${fieldName}`); } };

  // --- MAPPING LOGIC UPDATED FOR NEW PDF FIELD NAMES ---
  fillText('parties.seller', data.parties?.seller);
  fillText('parties.buyer', data.parties?.buyer);
  fillText('property.lot', data.property?.lot);
  fillText('property.block', data.property?.block);
  fillText('property.addition', data.property?.addition);
  fillText('property.city', data.property?.city);
  fillText('property.county', data.property?.county);
  fillText('property.address', data.property?.address);
  fillText('property.exclusions.part1', data.property?.exclusions?.part1);
  if (data.property?.hoaStatus === 'is_subject') check('property.hoaStatus.is_subject');
  if (data.property?.hoaStatus === 'not_subject') check('property.hoaStatus.not_subject');
  fillText('price.cashPortion', data.price?.cashPortion);
  fillText('price.financeAmount', data.price?.financeAmount);
  fillText('price.salesPrice', data.price?.salesPrice);
  if (data.financing?.thirdParty) check('financing.thirdParty');
  if (data.financing?.loanAssumption) check('financing.loanAssumption');
  if (data.financing?.seller) check('financing.seller');
  if (data.leases?.isResidential) check('leases.isResidential');
  if (data.leases?.isFixture) check('leases.isFixture');
  if (data.leases?.isNaturalResource) check('leases.isNaturalResource');
  fillText('earnestMoney.escrowAgentName', data.earnestMoney?.escrowAgentName);
  fillText('earnestMoney.escrowAgentAddress.part1', data.earnestMoney?.escrowAgentAddress?.part1);
  fillText('earnestMoney.amount', data.earnestMoney?.amount);
  fillText('earnestMoney.additionalAmount', data.earnestMoney?.additionalAmount);
  fillText('earnestMoney.additionalAmountDays', data.earnestMoney?.additionalAmountDays);
  fillText('optionFee.amount', data.optionFee?.amount);
  fillText('optionFee.days', data.optionFee?.days);
  fillText('titlePolicy.companyName', data.titlePolicy?.companyName);
  if (data.titlePolicy?.payer === 'Seller') check('titlePolicy.payer.Seller');
  if (data.titlePolicy?.payer === 'Buyer') check('titlePolicy.payer.Buyer');
  if (data.titlePolicy?.shortageAmendment?.status === 'shall_be_amended') check('titlePolicy.shortageAmendment.status.shall_be_amended');
  if (data.titlePolicy?.shortageAmendment?.status === 'will_not_be_amended') check('titlePolicy.shortageAmendment.status.will_not_be_amended');
  if (data.titlePolicy?.shortageAmendment?.payer === 'Seller') check('titlePolicy.shortageAmendment.payer.Seller');
  if (data.titlePolicy?.shortageAmendment?.payer === 'Buyer') check('titlePolicy.shortageAmendment.payer.Buyer');
  if (data.survey?.status === 'existing_survey_provided') check('survey.status.existing_survey_provided');
  if (data.survey?.status === 'new_survey_ordered') check('survey.status.new_survey_ordered');
  if (data.survey?.status === 'new_survey_by_seller') check('survey.status.new_survey_by_seller');
  fillText('objections.prohibitedUseActivity', data.objections?.prohibitedUseActivity);
  fillText('objections.objectionDays', data.objections?.objectionDays);
  if (data.propertyCondition?.acceptanceStatus === 'as_is') check('propertyCondition.acceptanceStatus.as_is');
  if (data.propertyCondition?.acceptanceStatus === 'as_is_with_repairs') check('propertyCondition.acceptanceStatus.as_is_with_repairs');
  fillText('propertyCondition.repairsList.part1', data.propertyCondition?.repairsList?.part1);
  fillText('brokers.listing.firmName', data.brokers?.listing?.firmName);
  fillText('brokers.listing.firmLicenseNo', data.brokers?.listing?.firmLicenseNo);
  fillText('brokers.listing.associate.name', data.brokers?.listing?.associate?.name);
  fillText('brokers.listing.associate.licenseNo', data.brokers?.listing?.associate?.licenseNo);
  fillText('brokers.listing.associate.email', data.brokers?.listing?.associate?.email);
  fillText('brokers.listing.associate.phone', data.brokers?.listing?.associate?.phone);
  fillText('brokers.listing.supervisor.name', data.brokers?.listing?.supervisor?.name);
  fillText('brokers.listing.supervisor.licenseNo', data.brokers?.listing?.supervisor?.licenseNo);
  fillText('brokers.listing.address.street', data.brokers?.listing?.address?.street);
  if (data.brokers?.listing?.represents === 'seller_agent') check('brokers.listing.represents.seller_agent');
  if (data.brokers?.listing?.represents === 'intermediary') check('brokers.listing.represents.intermediary');
  fillText('brokers.other.firmName', data.brokers?.other?.firmName);
  fillText('brokers.other.firmLicenseNo', data.brokers?.other?.firmLicenseNo);
  fillText('brokers.other.associate.name', data.brokers?.other?.associate?.name);
  fillText('brokers.other.associate.licenseNo', data.brokers?.other?.associate?.licenseNo);
  if (data.brokers?.other?.represents === 'buyer_agent') check('brokers.other.represents.buyer_agent');
  if (data.brokers?.other?.represents === 'seller_subagent') check('brokers.other.represents.seller_subagent');
  fillText('brokers.selling.associate.name', data.brokers?.selling?.associate?.name);
  fillText('brokers.selling.associate.licenseNo', data.brokers?.selling?.associate?.licenseNo);
  fillText('closing.date.monthDay', data.closing?.date?.monthDay);
  fillText('closing.date.year', data.closing?.date?.year);
  if (data.possession?.status === 'upon_closing') check('possession.status.upon_closing');
  if (data.possession?.status === 'temporary_lease') check('possession.status.temporary_lease');
  fillText('specialProvisions.text', data.specialProvisions?.text);
  fillText('notices.buyer.contactInfo.part1', data.notices?.buyer?.contactInfo?.part1);
  fillText('notices.seller.contactInfo.part1', data.notices?.seller?.contactInfo?.part1);
  if (data.addenda?.thirdPartyFinancing) check('addenda.thirdPartyFinancing');
  if (data.addenda?.sellerFinancing) check('addenda.sellerFinancing');
  if (data.addenda?.hoa) check('addenda.hoa');
  if (data.addenda?.buyersTemporaryLease) check('addenda.buyersTemporaryLease');
  if (data.addenda?.loanAssumption) check('addenda.loanAssumption');
  if (data.addenda?.saleOfOtherProperty) check('addenda.saleOfOtherProperty');
  if (data.addenda?.leadBasedPaint) check('addenda.leadBasedPaint');
  if (data.addenda?.sellersTemporaryLease) check('addenda.sellersTemporaryLease');
  fillText('attorneys.buyer.name', data.attorneys?.buyer?.name);
  fillText('attorneys.seller.name', data.attorneys?.seller?.name);
  fillText('execution.day', data.execution?.day);
  fillText('execution.month', data.execution?.month);
  fillText('execution.year', data.execution?.year);

  form.flatten();
  return await pdfDoc.save();
}

export async function handleSingleContractSubmission(data: Trec14ContractData): Promise<{ success: boolean; error?: string; pdfBytes?: number[]; fileName?: string }> {
  try {
    const user = await getUser();
    if (!user) { return { success: false, error: 'User is not authenticated.' }; }
    const teamData = await getTeamForUser();
    if (!teamData) { return { success: false, error: 'Could not find team information.' }; }
    const team = await db.query.teams.findFirst({ where: eq(teams.id, teamData.id), });
    if (!team) { return { success: false, error: 'Could not find team information.' }; }
    if (team.contractCredits < 1) { return { success: false, error: 'Insufficient credits. Please purchase more to generate a contract.' }; }

    const newContractId = await db.transaction(async (tx) => {
      const [newContract] = await tx.insert(contracts).values({ teamId: team.id, userId: user.id, contractData: data, }).returning({ id: contracts.id });
      await tx.update(teams).set({ contractCredits: team.contractCredits - 1 }).where(eq(teams.id, team.id));
      return newContract.id;
    });

    const pdfBytes = await generateContractAction(newContractId);
    revalidatePath('/dashboard/contracts');
    return { success: true, pdfBytes: Array.from(pdfBytes), fileName: `TREC_Contract_${data.property?.address?.replace(/[\s,]/g, '_') || newContractId}.pdf`, };
  } catch (error) {
    console.error("Error in handleSingleContractSubmission:", error);
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}