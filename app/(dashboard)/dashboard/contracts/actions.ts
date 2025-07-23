// app/(dashboard)/dashboard/contracts/actions.ts

'use server';

import { db } from '@/lib/db/drizzle';
import { properties } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { trecFieldMap } from '@/lib/mappings/trec1-4-mapping';

export async function generateContractAction(propertyId: number) {
  const user = await getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Fetch the specific property and its related owner data
  const propertyData = await db.query.properties.findFirst({
    where: eq(properties.id, propertyId),
    with: {
      owner: true, // This uses the 'relations' we defined in the schema
    },
  });

  if (!propertyData || !propertyData.owner) {
    throw new Error('Property data not found.');
  }

  // --- PDF Generation Logic ---
  const templatePath = path.join(process.cwd(), 'lib/templates/TREC-1-4.pdf');
  const pdfTemplateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
  const form = pdfDoc.getForm();

  // Use the map to fill fields
  form.getTextField(trecFieldMap.parties.seller).setText('SELLER_NAME_PLACEHOLDER'); // Replace with actual seller data if available
  form.getTextField(trecFieldMap.parties.buyer).setText(propertyData.owner.fullName || '');
  form.getTextField(trecFieldMap.property.lot).setText(propertyData.lot || ''); // Assuming 'lot' exists on propertyData
  form.getTextField(trecFieldMap.property.block).setText(propertyData.block || ''); // Assuming 'block' exists
  form.getTextField(trecFieldMap.property.addition).setText(propertyData.addition || ''); // Assuming 'addition' exists
  form.getTextField(trecFieldMap.property.county).setText(propertyData.county || ''); // Assuming 'county' exists
  form.getTextField(trecFieldMap.property.knownAddress).setText(`${propertyData.streetAddress}, ${propertyData.city}, TX ${propertyData.zipCode}`);
  
  // Example for a price field
  const offerPrice = parseFloat(propertyData.offerPrice || '0');
  form.getTextField(trecFieldMap.price.salesPrice).setText(offerPrice.toString());


  // Flatten the form to make it non-editable
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}