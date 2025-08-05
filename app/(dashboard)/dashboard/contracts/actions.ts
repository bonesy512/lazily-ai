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
  if (!user) {
    throw new Error('Not authenticated');
  }

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
  });

  if (!contract) {
    throw new Error('Contract not found.');
  }
  
  const data = contract.contractData as Trec14ContractData;

  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  // --- Comprehensive, Direct Field Mapping ---

  // Parties
  form.getTextField('parties.seller').setText(data.parties?.seller || '');
  form.getTextField('parties.buyer').setText(data.parties?.buyer || '');
  
  // Property
  form.getTextField('property.lot').setText(data.property?.lot || '');
  form.getTextField('property.block').setText(data.property?.block || '');
  form.getTextField('property.addition').setText(data.property?.addition || '');
  form.getTextField('property.city').setText(data.property?.city || '');
  form.getTextField('property.county').setText(data.property?.county || '');
  form.getTextField('property.address').setText(data.property?.address || '');

  // Price
  form.getTextField('price.cashPortion').setText(data.price?.cashPortion || '');
  form.getTextField('price.financeAmount').setText(data.price?.financeAmount || '');
  form.getTextField('price.salesPrice').setText(data.price?.salesPrice || '');
  
  // Financing Checkboxes
  if (data.financing?.thirdParty) form.getCheckBox('financing.thirdParty').check();
  if (data.financing?.loanAssumption) form.getCheckBox('financing.loanAssumption').check();
  if (data.financing?.seller) form.getCheckBox('financing.seller').check();

  // Earnest Money
  form.getTextField('earnestMoney.amount').setText(data.earnestMoney?.amount || '');
  form.getTextField('earnestMoney.additionalAmount').setText(data.earnestMoney?.additionalAmount || '');
  form.getTextField('earnestMoney.additionalAmountDays').setText(data.earnestMoney?.additionalAmountDays || '');
  form.getTextField('earnestMoney.escrowAgentName').setText(data.earnestMoney?.escrowAgentName || '');
  
  // Option Fee
  form.getTextField('optionFee.amount').setText(data.optionFee?.amount || '');
  form.getTextField('optionFee.days').setText(data.optionFee?.days || '');

  // Title Policy
  form.getTextField('titlePolicy.companyName').setText(data.titlePolicy?.companyName || '');

  // Special Provisions
  form.getTextField('specialProvisions.text').setText(data.specialProvisions?.text || '');

  // Closing
  form.getTextField('closing.date.monthDay').setText(data.closing?.date?.monthDay || '');
  form.getTextField('closing.date.year').setText(data.closing?.date?.year || '');
  
  // Addenda Checkboxes
  if (data.addenda?.thirdPartyFinancing) form.getCheckBox('addenda.thirdPartyFinancing').check();
  if (data.addenda?.sellerFinancing) form.getCheckBox('addenda.sellerFinancing').check();
  if (data.addenda?.hoa) form.getCheckBox('addenda.hoa').check();
  if (data.addenda?.buyersTemporaryLease) form.getCheckBox('addenda.buyersTemporaryLease').check();
  if (data.addenda?.loanAssumption) form.getCheckBox('addenda.loanAssumption').check();
  if (data.addenda?.saleOfOtherProperty) form.getCheckBox('addenda.saleOfOtherProperty').check();
  if (data.addenda?.leadBasedPaint) form.getCheckBox('addenda.leadBasedPaint').check();
  
  form.flatten();
  return await pdfDoc.save();
}