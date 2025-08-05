// app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { contracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { trecFieldMap } from '@/lib/mappings/trec1-4-mapping';
import { Trec14ContractData } from '@/lib/contracts/validation'; // <--- THIS WAS THE MISSING LINE

export async function generateContractAction(contractId: number): Promise<Uint8Array> {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch the specific contract and its data
  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId),
  });

  if (!contract) {
    throw new Error('Contract not found.');
  }
  
  // Safely cast the contractData to our known type
  const data = contract.contractData as Trec14ContractData;

  // --- PDF Generation Logic ---
  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-1-4.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  // Use the map to fill fields based on our data
  form.getTextField(trecFieldMap.parties.seller).setText(data.parties?.seller || '');
  form.getTextField(trecFieldMap.parties.buyer).setText(data.parties?.buyer || '');
  
  const fullAddress = `${data.property?.address || ''}, ${data.property?.city || ''}, TX`;
  form.getTextField(trecFieldMap.property.knownAddress).setText(fullAddress);
  
  form.getTextField(trecFieldMap.price.salesPrice).setText(data.price?.salesPrice || '0');
  form.getTextField(trecFieldMap.price.cashPortion).setText(data.price?.cashPortion || '0');
  form.getTextField(trecFieldMap.price.financeAmount).setText(data.price?.financeAmount || '0');
  
  form.getTextField(trecFieldMap.earnestMoney.amount).setText(data.earnestMoney?.amount || '0');

  // Flatten the form to make it non-editable
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  // Return the raw bytes of the PDF file
  return pdfBytes;
}