// lib/mappings/trec1-4-mapping.ts

// This file translates our clean database fields to the messy PDF field names.
// We will fill this out with all the necessary fields.

export const trecFieldMap = {
  // Section 1: Parties
  parties: {
    seller: '1 PARTIES The parties to this contract are',
    buyer: 'Seller and',
  },
  
  // Section 2: Property
  property: {
    lot: 'A LAND Lot',
    block: 'Block',
    addition: 'Addition City of',
    county: 'County of',
    knownAddress: 'Texas known as',
  },

  // THE FIX IS HERE: Renamed 'earnestMoney' to 'price'
  price: {
    amount: 'earnest money of',
    titleCompany: 'insurance Title Policy issued by',
    salesPrice: 'undefined_6', // Added from our mapping session
  },
  
  // ... we will continue to add other fields here as we build the PDF generation logic
};