// lib/mappings/trec1-4-mapping.ts

// This file translates our clean database/CSV fields to the messy PDF field names.
// This map is used by the PDF generation engine to correctly place data onto the form.

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

  // Section 3: Sales Price
  price: {
    cashPortion: 'Text1',
    financeAmount: 'Text2',
    salesPrice: 'undefined_6',
  },

  // Section 4: Financing Addenda Checkboxes
  financing: {
    thirdParty: 'Third Party Financing Addendum',
    loanAssumption: 'Loan Assumption Addendum',
    seller: 'Seller Financing Addendum',
  },

  // Section 5: Earnest Money
  earnestMoney: {
    amount: 'earnest money of',
  },

  // Section 6: Title Policy & Survey
  titlePolicy: {
    sellerPays: 'Sellers',
    buyerPays: 'Buyer',
    amendShortages: 'ii will be amended to read shortages in area at the expense of',
  },
  survey: {
    sellerPays: 'Sellers_2',
    buyerPays: 'Buyers expense no later',
  },

  // Section 7: Property Condition
  propertyCondition: {
    asIs: '1 Buyer accepts the Property As Is',
    asIsWithRepairs: '2 Buyer accepts the Property As Is provided Seller at Sellers expense shall complete the',
    repairsList: 'following specific repairs and treatments',
  },

  // Section 8: Brokers & Commissions
  brokers: {
    listingFirmName: 'Listing Broker Firm',
    listingFirmLicense: 'License No_4',
    listingAgentName: 'Listing Associates Name',
    sellingAgentName: 'Selling Associates Name-1',
  },
  commission: {
    listingBroker: 'when the Listing Brokers fee is received Escrow agent is authorized and directed to pay Other Broker from',
    otherBroker: 'pay Other Broker from',
  },

  // Section 9: Closing
  closing: {
    date: 'A The closing of the sale will be on or before',
  },

  // Section 12: Settlement Expenses
  settlement: {
    sellerContribution: 'Buyers Expenses as allowed by the lender',
  },

  // Section 21: Notices
  notices: {
    buyerEmail: 'Email',
    sellerEmail: 'Email_2',
  },

  // Section 22: Addenda Checkboxes
  addenda: {
    subjectTo: 'Addendum for Property Subject to',
    sellerLease: 'Sellers Temporary Residential Lease',
    buyerLease: 'Buyers Temporary Residential Lease',
  },

  // Section 23: Option Fee
  optionFee: {
    amount: 'acknowledged by Seller and Buyers agreement to pay Seller',
    days: 'Buyer has paid Seller', // Note: This was identified as the field for days
    creditToSales: 'will',
  },

  // Execution Block
  execution: {
    date: 'EXECUTED the',
    monthYear: 'day of',
  },
};
