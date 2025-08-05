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

  const fillText = (fieldName: string, value: string | null | undefined) => {
    try {
      if (value) form.getTextField(fieldName).setText(value);
    } catch (e) { console.log(`Could not find TextField: ${fieldName}`); }
  };

  const check = (fieldName: string, value: boolean | null | undefined) => {
    try {
      if (value) form.getCheckBox(fieldName).check();
    } catch (e) { console.log(`Could not find CheckBox: ${fieldName}`); }
  };

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
  
  if (data.property?.hoaStatus === 'is') check('property.hoaStatus.is', true);
  else if (data.property?.hoaStatus === 'is not') check('property.hoaStatus.is not', true);

  // Price
  fillText('price.cashPortion', data.price?.cashPortion);
  fillText('price.financeAmount', data.price?.financeAmount);
  fillText('price.salesPrice', data.price?.salesPrice);

  // Financing
  check('financing.thirdParty', data.financing?.thirdParty);

  // Earnest Money
  fillText('earnestMoney.amount', data.earnestMoney?.amount);
  fillText('earnestMoney.escrowAgentName', data.earnestMoney?.escrowAgentName);

  // Option Fee
  fillText('optionFee.amount', data.optionFee?.amount);
  fillText('optionFee.days', data.optionFee?.days);

  // Title Policy
  if (data.titlePolicy?.payer === 'Seller') check('titlePolicy.payer.Seller', true);
  else if (data.titlePolicy?.payer === 'Buyer') check('titlePolicy.payer.Buyer', true);
  
  // Survey
  if (data.survey?.status === `Buyer's Expense`) check(`survey.status.Buyer's Expense`, true);
  else if (data.survey?.status === `Seller's Expense`) check(`survey.status.Seller's Expense`, true);
  
  // Property Condition
  if (data.propertyCondition?.sellerDisclosure?.status === 'has been received') check('propertyCondition.sellerDisclosure.status.has been received', true);
  else if (data.propertyCondition?.sellerDisclosure?.status === 'has not been received') check('propertyCondition.sellerDisclosure.status.has not been received', true);
  
  if (data.propertyCondition?.acceptanceStatus === 'as is') check('propertyCondition.acceptanceStatus.as is', true);
  else if (data.propertyCondition?.acceptanceStatus === 'as is with repairs') check('propertyCondition.acceptanceStatus.as is with repairs', true);

  // Brokers
  if (data.brokers?.listing?.represents === `Seller as Seller's agent`) check(`brokers.listing.represents.Seller as Seller's agent`, true);
  else if (data.brokers?.listing?.represents === `Seller and Buyer as an intermediary`) check(`brokers.listing.represents.Seller and Buyer as an intermediary`, true);

  if (data.brokers?.other?.represents === `Buyer as Buyer's agent`) check(`brokers.other.represents.Buyer as Buyer's agent`, true);
  else if (data.brokers?.other?.represents === `Seller as Listing Broker's subagent`) check(`brokers.other.represents.Seller as Listing Broker's subagent`, true);

  // Closing
  fillText('closing.date.monthDay', data.closing?.date?.monthDay);
  fillText('closing.date.year', data.closing?.date?.year);

  // Possession
  if (data.possession?.status === 'closing and funding') check('possession.status.closing and funding', true);
  else if (data.possession?.status === 'according to lease') check('possession.status.according to lease', true);
  
  // Special Provisions
  fillText('specialProvisions.text', data.specialProvisions?.text);
  
  form.flatten();
  return await pdfDoc.save();
}