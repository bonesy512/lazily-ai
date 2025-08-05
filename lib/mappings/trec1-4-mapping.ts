// lib/mappings/trec1-4-mapping.ts

// This file translates our clean database/CSV fields to the messy PDF field names.
// This map is used by the PDF generation engine to correctly place data onto the form.
export const trecFieldMap = {
  // Section 1: Parties
  parties: {
    seller: '1 PARTIES The parties to this contract are', // Field for Seller's name
    buyer: 'Seller and', // Field for Buyer's name
  },
  
  // Section 2: Property
  property: {
    lot: 'A LAND Lot', // Field for Lot number
    block: 'Block', // Field for Block number
    addition: 'Addition City of', // Field for Addition/City
    county: 'County of', // Field for County
    knownAddress: 'Texas known as', // Field for Property's known address
  },

  // Section 3: Sales Price
  price: {
    cashPortion: 'Text1', // Field for cash portion of the sales price
    financeAmount: 'Text2', // Field for the financed amount
    salesPrice: 'undefined_6', // Field for the total sales price
  },

  // Section 4: Financing Addenda Checkboxes
  financing: {
    thirdParty: 'Third Party Financing Addendum', // Checkbox for Third Party Financing Addendum
    loanAssumption: 'Loan Assumption Addendum', // Checkbox for Loan Assumption Addendum
    seller: 'Seller Financing Addendum', // Checkbox for Seller Financing Addendum
  },

  // Section 5: Earnest Money
  earnestMoney: {
    amount: 'earnest money of', // Field for the earnest money amount
  },

  // Section 6: Title Policy & Survey
  titlePolicy: {
    sellerPays: 'Sellers', // Checkbox for Seller paying for title policy
    buyerPays: 'Buyer', // Checkbox for Buyer paying for title policy
    amendShortages: 'ii will be amended to read shortages in area at the expense of', // Checkbox for amending shortages
  },
  survey: {
    sellerPays: 'Sellers_2', // Checkbox for Seller paying for survey
    buyerPays: 'Buyers expense no later', // Checkbox for Buyer paying for survey
  },

  // Section 7: Property Condition
  propertyCondition: {
    asIs: '1 Buyer accepts the Property As Is', // Checkbox for accepting property "As Is"
    asIsWithRepairs: '2 Buyer accepts the Property As Is provided Seller at Sellers expense shall complete the', // Checkbox for accepting property "As Is" with repairs
    repairsList: 'following specific repairs and treatments', // Field for listing specific repairs
  },

  // Section 8: Brokers & Commissions
  brokers: {
    listingFirmName: 'Listing Broker Firm', // Field for Listing Broker Firm name
    listingFirmLicense: 'License No_4', // Field for Listing Broker Firm license number
    listingAgentName: 'Listing Associates Name', // Field for Listing Associate's name
    sellingAgentName: 'Selling Associates Name-1', // Field for Selling Associate's name
  },
  commission: {
    listingBroker: 'when the Listing Brokers fee is received Escrow agent is authorized and directed to pay Other Broker from', // Field for listing broker commission
    otherBroker: 'pay Other Broker from', // Field for other broker commission
  },

  // Section 9: Closing
  closing: {
    date: 'A The closing of the sale will be on or before', // Field for the closing date
  },

  // Section 12: Settlement Expenses
  settlement: {
    sellerContribution: 'Buyers Expenses as allowed by the lender', // Field for seller's contribution to buyer's expenses
  },

  // Section 21: Notices
  notices: {
    buyerEmail: 'Email', // Field for Buyer's email address
    sellerEmail: 'Email_2', // Field for Seller's email address
  },

  // Section 22: Addenda Checkboxes
  addenda: {
    subjectTo: 'Addendum for Property Subject to', // Checkbox for Addendum for Property Subject to
    sellerLease: 'Sellers Temporary Residential Lease', // Checkbox for Seller's Temporary Residential Lease
    buyerLease: 'Buyers Temporary Residential Lease', // Checkbox for Buyer's Temporary Residential Lease
  },

  // Section 23: Option Fee
  optionFee: {
    amount: 'acknowledged by Seller and Buyers agreement to pay Seller', // Field for the option fee amount
    days: 'Buyer has paid Seller', // Note: This was identified as the field for days
    creditToSales: 'will', // Checkbox for crediting option fee to sales price
  },

  // Execution Block
  execution: {
    date: 'EXECUTED the', // Field for the execution date
    monthYear: 'day of', // Field for the month and year of execution
  },
};