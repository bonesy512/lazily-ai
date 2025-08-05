// lib/contracts/transformation.ts

import { Trec14ContractData } from "./validation";

const toBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const lowerCaseValue = value.toLowerCase();
  return lowerCaseValue === 'true' || lowerCaseValue === 'yes' || lowerCaseValue === '1';
};

export const mapCsvRowToJson = (row: Record<string, string>): Trec14ContractData => {
  const financingThirdParty = toBoolean(row.financing_thirdParty);
  const financingLoanAssumption = toBoolean(row.financing_loanAssumption);
  const financingSeller = toBoolean(row.financing_seller);

  return {
    parties: {
      seller: row.parties_seller || null,
      buyer: row.parties_buyer || null,
    },
    property: {
      lot: row.property_lot || null,
      block: row.property_block || null,
      addition: row.property_addition || null,
      city: row.property_city || null,
      county: row.property_county || null,
      address: row.property_address || null,
      exclusions: { part1: null, part2: null }, // Defaulting non-CSV fields
      hoaStatus: null,
    },
    price: {
      cashPortion: row.price_cashPortion || null,
      financeAmount: row.price_financeAmount || null,
      salesPrice: row.price_salesPrice || null,
    },
    financing: {
      thirdParty: financingThirdParty,
      loanAssumption: financingLoanAssumption,
      seller: financingSeller,
    },
    earnestMoney: {
      amount: row.earnestMoney_amount || null,
      additionalAmount: row.earnestMoney_additionalAmount || null,
      additionalAmountDays: row.earnestMoney_additionalAmountDays || null,
      escrowAgentName: row.earnestMoney_escrowAgentName || null,
      escrowAgentAddress: { part1: null, part2: null },
    },
    optionFee: {
      amount: row.optionFee_amount || null,
      days: row.optionFee_days || null,
    },
    titlePolicy: {
      companyName: row.titlePolicy_companyName || null,
      payer: null,
      shortageAmendment: { status: null, payer: null },
    },
    specialProvisions: {
      text: row.specialProvisions_text || null,
    },
    closing: {
      date: {
        monthDay: row.closing_date_monthDay || null,
        year: row.closing_date_year || null,
      },
    },
    addenda: {
      thirdPartyFinancing: toBoolean(row.addenda_thirdPartyFinancing),
      sellerFinancing: toBoolean(row.addenda_sellerFinancing),
      hoa: toBoolean(row.addenda_hoa),
      buyersTemporaryLease: toBoolean(row.addenda_buyersTemporaryLease),
      loanAssumption: toBoolean(row.addenda_loanAssumption),
      saleOfOtherProperty: toBoolean(row.addenda_saleOfOtherProperty),
      leadBasedPaint: toBoolean(row.addenda_leadBasedPaint),
      // Defaulting other addenda
      mineralReservation: false, backupContract: false, coastalAreaProperty: false,
      hydrostaticTesting: false, lenderAppraisalTermination: false, environmentalAssessment: false,
      sellersTemporaryLease: false, shortSale: false, seawardOfGulfWaterway: false,
      propaneGasSystem: false, residentialLeases: false, fixtureLeases: false,
      section1031Exchange: false, improvementDistrict: false, otherText: { p1: null },
    },
    // Defaulting other sections not included in the comprehensive CSV for MVP
    leases: { isResidential: false, isFixture: false, isNaturalResource: false, naturalResourceTerminationDays: null, naturalResourceDeliveryStatus: 'will not be delivered' },
    survey: { status: null, existing: { deliveryDays: null, affidavitPayer: null }, new: { deliveryDays: null }, newBySeller: { deliveryDays: null } },
    objections: { prohibitedUseActivity: null, objectionDays: null },
    propertyCondition: { sellerDisclosure: { status: null, deliveryDays: null }, acceptanceStatus: 'as is', repairsList: { part1: null, part2: null } },
    serviceContract: { maxCost: null },
    brokers: { listing: { associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null }, represents: null, firmName: null, firmLicenseNo: null, supervisor: { name: null, licenseNo: null }, address: { street: null, city: null, state: null, zip: null, phone: null } }, other: { firmName: null, firmLicenseNo: null, represents: null, associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null }, supervisor: { name: null, licenseNo: null }, address: { street: null, city: null, state: null, zip: null, phone: null } }, disclosure: { fee: { dollarAmount: null, percentage: null, type: null } } },
    possession: { status: 'closing and funding' },
    settlement: { sellerContributionToBrokerage: { type: null, dollarAmount: null, percentage: null }, sellerContributionToOther: { amount: null } },
    notices: { buyer: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } }, seller: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } } },
    attorneys: { buyer: { name: null, phone: null, fax: null, email: null }, seller: { name: null, phone: null, fax: null, email: null } },
    execution: { day: null, month: null, year: null },
  };
};