// app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { Trec14ContractData } from '@/lib/contracts/validation';

export async function generateContractAction(contractId: number): Promise<Uint8Array> {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  const contract = await db.query.contracts.findFirst({ where: eq(contracts.id, contractId) });
  if (!contract) throw new Error('Contract not found.');
  
  const data = contract.contractData as Trec14ContractData;

  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  // Helper functions to safely fill fields
  const fillText = (fieldName: string | undefined, value: string | null | undefined) => {
    if (fieldName && value) form.getTextField(fieldName).setText(value);
  };

  const check = (fieldName: string | undefined, value: boolean | null | undefined) => {
    if (fieldName && value) form.getCheckBox(fieldName).check();
  };

  // --- Exhaustive mapping from the JSON data to the PDF fields ---

  // Parties
  fillText('parties.seller', data.parties?.seller);
  fillText('parties.buyer', data.parties?.buyer);

  // Property
  fillText('property.lot', data.property?.lot);
  fillText('property.block', data.property?.block);
  fillText('property.addition', data.property?.addition);
  fillText('property.city', data.property?.city);
  fillText('property.county', data.property?.county);
  fillText('property.address', data.property?.address);
  fillText('property.exclusions.part1', data.property?.exclusions?.part1);
  fillText('property.exclusions.part2', data.property?.exclusions?.part2);
  
  // HOA Status Logic (Defaulting to "is not")
  const hoaStatus = data.property?.hoaStatus || 'is not';
  if (hoaStatus === 'is') check('property.hoaStatus.is', true);
  else if (hoaStatus === 'is not') check('property.hoaStatus.is_not', true);


  // Price
  fillText('price.cashPortion', data.price?.cashPortion);
  fillText('price.financeAmount', data.price?.financeAmount);
  fillText('price.salesPrice', data.price?.salesPrice);

  // Financing
  check('financing.thirdParty', data.financing?.thirdParty);
  check('financing.loanAssumption', data.financing?.loanAssumption);
  check('financing.seller', data.financing?.seller);
  
  // Leases
  check('leases.isResidential', data.leases?.isResidential);
  check('leases.isFixture', data.leases?.isFixture);
  check('leases.isNaturalResource', data.leases?.isNaturalResource);

  // Earnest Money
  fillText('earnestMoney.escrowAgentName', data.earnestMoney?.escrowAgentName);
  fillText('earnestMoney.escrowAgentAddress.part1', data.earnestMoney?.escrowAgentAddress?.part1);
  fillText('earnestMoney.amount', data.earnestMoney?.amount);
  fillText('earnestMoney.additionalAmount', data.earnestMoney?.additionalAmount);
  fillText('earnestMoney.additionalAmountDays', data.earnestMoney?.additionalAmountDays);

  // Option Fee
  fillText('optionFee.amount', data.optionFee?.amount);
  fillText('optionFee.days', data.optionFee?.days);

  // Title Policy
  fillText('titlePolicy.companyName', data.titlePolicy?.companyName);
  const payer = data.titlePolicy?.payer || 'Seller'; // Default to Seller
  if (payer === 'Seller') check('titlePolicy.payer.Seller', true);
  else if (payer === 'Buyer') check('titlePolicy.payer.Buyer', true);
  
  const shortageStatus = data.titlePolicy?.shortageAmendment?.status || 'will not be amended'; // Default
  if (shortageStatus === 'shall be amended') check('titlePolicy.shortageAmendment.status.shall_be_amended', true);
  else if (shortageStatus === 'will not be amended') check('titlePolicy.shortageAmendment.status.will_not_be_amended', true);

  const shortagePayer = data.titlePolicy?.shortageAmendment?.payer || 'Buyer'; // Default to Buyer
  if (shortagePayer === 'Seller') check('titlePolicy.shortageAmendment.payer.Seller', true);
  else if (shortagePayer === 'Buyer') check('titlePolicy.shortageAmendment.payer.Buyer', true);


  // Survey
  const surveyStatus = data.survey?.status || "Seller's Expense"; // Default
  if (surveyStatus === "Seller's Expense") check("survey.status.Sellers_Expense", true);
  else if (surveyStatus === "Buyer's Expense") check("survey.status.Buyers_Expense", true);
  
  // Objections
  fillText('objections.objectionDays', data.objections?.objectionDays);

  // Property Condition
  const disclosureStatus = data.propertyCondition?.sellerDisclosure?.status || 'has not been received'; // Default
  if (disclosureStatus === 'has been received') check('propertyCondition.sellerDisclosure.status.has_been_received', true);
  else if (disclosureStatus === 'has not been received') check('propertyCondition.sellerDisclosure.status.has_not_been_received', true);
  
  fillText('propertyCondition.sellerDisclosure.deliveryDays', data.propertyCondition?.sellerDisclosure?.deliveryDays);
  
  const acceptanceStatus = data.propertyCondition?.acceptanceStatus || 'as is'; // Default
  if (acceptanceStatus === 'as is') check('propertyCondition.acceptanceStatus.as_is', true);
  else if (acceptanceStatus === 'as is with repairs') check('propertyCondition.acceptanceStatus.as_is_with_repairs', true);

  fillText('propertyCondition.repairsList.part1', data.propertyCondition?.repairsList?.part1);
  
  // Brokers
  fillText('brokers.listing.associate.name', data.brokers?.listing?.associate?.name);
  fillText('brokers.listing.associate.licenseNo', data.brokers?.listing?.associate?.licenseNo);
  fillText('brokers.listing.firmName', data.brokers?.listing?.firmName);
  fillText('brokers.listing.firmLicenseNo', data.brokers?.listing?.firmLicenseNo);
  fillText('brokers.other.associate.name', data.brokers?.other?.associate?.name);
  fillText('brokers.other.associate.licenseNo', data.brokers?.other?.associate?.licenseNo);
  fillText('brokers.other.firmName', data.brokers?.other?.firmName);
  fillText('brokers.other.firmLicenseNo', data.brokers?.other?.firmLicenseNo);

  // Closing
  fillText('closing.date.monthDay', data.closing?.date?.monthDay);
  fillText('closing.date.year', data.closing?.date?.year);

  // Possession
  const possessionStatus = data.possession?.status || 'closing and funding'; // Default
  if (possessionStatus === 'closing and funding') check('possession.status.closing_and_funding', true);
  else if (possessionStatus === 'according to lease') check('possession.status.according_to_lease', true);


  // Special Provisions
  fillText('specialProvisions.text', data.specialProvisions?.text);

  // Settlement
  fillText('settlement.sellerContributionToOther.amount', data.settlement?.sellerContributionToOther?.amount);
  
  // Notices
  fillText('notices.buyer.contactInfo.part1', data.notices?.buyer?.contactInfo?.part1);
  fillText('notices.seller.contactInfo.part1', data.notices?.seller?.contactInfo?.part1);

  // Addenda
  check('addenda.thirdPartyFinancing', data.addenda?.thirdPartyFinancing);
  check('addenda.sellerFinancing', data.addenda?.sellerFinancing);
  check('addenda.hoa', data.addenda?.hoa);
  check('addenda.buyersTemporaryLease', data.addenda?.buyersTemporaryLease);
  check('addenda.loanAssumption', data.addenda?.loanAssumption);
  check('addenda.saleOfOtherProperty', data.addenda?.saleOfOtherProperty);
  check('addenda.leadBasedPaint', data.addenda?.leadBasedPaint);
  check('addenda.sellersTemporaryLease', data.addenda?.sellersTemporaryLease);
  fillText('addenda.otherText.p1', data.addenda?.otherText?.p1);

  // Attorneys
  fillText('attorneys.buyer.name', data.attorneys?.buyer?.name);
  fillText('attorneys.buyer.phone', data.attorneys?.buyer?.phone);
  fillText('attorneys.buyer.email', data.attorneys?.buyer?.email);
  fillText('attorneys.seller.name', data.attorneys?.seller?.name);
  fillText('attorneys.seller.phone', data.attorneys?.seller?.phone);
  fillText('attorneys.seller.email', data.attorneys?.seller?.email);

  // Execution
  fillText('execution.day', data.execution?.day);
  fillText('execution.month', data.execution?.month);
  fillText('execution.year', data.execution?.year);

  form.flatten();
  return await pdfDoc.save();
}