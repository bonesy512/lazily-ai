// app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
// REMOVED: No longer importing the unnecessary trecFieldMap
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

  // --- PDF Generation Logic ---
  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-20-18-automated-v1.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  // --- REFACTORED: Using direct key names that match your custom PDF ---
  // This assumes you named the PDF fields 'parties.seller', 'property.address', etc.
  
  // Parties
  form.getTextField('parties.seller').setText(data.parties?.seller || '');
  form.getTextField('parties.buyer').setText(data.parties?.buyer || '');
  
  // Property
  form.getTextField('property.address').setText(data.property?.address || '');
  form.getTextField('property.lot').setText(data.property?.lot || '');
  form.getTextField('property.block').setText(data.property?.block || '');
  form.getTextField('property.addition').setText(data.property?.addition || '');
  form.getTextField('property.city').setText(data.property?.city || '');
  form.getTextField('property.county').setText(data.property?.county || '');
  
  // Price
  form.getTextField('price.salesPrice').setText(data.price?.salesPrice || '');
  form.getTextField('price.cashPortion').setText(data.price?.cashPortion || '');
  form.getTextField('price.financeAmount').setText(data.price?.financeAmount || '');

  // Flatten the form to make it non-editable
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}