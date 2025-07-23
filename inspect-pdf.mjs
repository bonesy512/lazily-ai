// inspect-pdf.mjs

import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

async function getPdfFieldNames() {
  try {
    console.log('Loading PDF template...');
    const templatePath = path.join(process.cwd(), 'lib/templates/TREC-1-4.pdf');
    const pdfTemplateBytes = await fs.readFile(templatePath);

    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('--- 📋 TREC 1-4 Form Fields ---');
    fields.forEach(field => {
      const type = field.constructor.name;
      const name = field.getName();
      console.log(`${name} (Type: ${type})`);
    });
    console.log('-----------------------------');
    console.log(`✅ Found ${fields.length} fields.`);

  } catch (error) {
    console.error('Error inspecting PDF:', error);
  }
}

getPdfFieldNames();