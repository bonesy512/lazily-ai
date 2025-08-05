// lib/contracts/transformation.ts

import { Trec14ContractData } from "./validation";

/**
 * Converts a string representation of a boolean ('true', 'yes', '1') to a boolean type.
 * Case-insensitive. Returns false for any other value.
 * @param value The string value from the CSV.
 * @returns boolean
 */
const toBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const lowerCaseValue = value.toLowerCase();
  return lowerCaseValue === 'true' || lowerCaseValue === 'yes' || lowerCaseValue === '1';
};

/**
 * This is the crucial transformation function. It takes a flat row object from a parsed CSV
 * and maps it into the nested, structured Trec14ContractData object
 * that our application uses internally.
 *
 * @param row A single row from the CSV, where keys are the column headers.
 * @returns A structured Trec14ContractData object.
 */
export const mapCsvRowToJson = (row: Record<string, string>): Trec14ContractData => {
  return {
    parties: {
      seller: row.Seller_Name || null,
      buyer: row.Buyer_Name || null,
    },
    property: {
      address: row.Property_Address || null,
      city: row.Property_City || null,
      county: row.Property_County || null,
      lot: row.Property_Lot || null,
      block: row.Property_Block || null,
      addition: row.Property_Addition || null,
      // Defaulting these values, can be expanded later
      exclusions: { part1: null, part2: null },
      hoaStatus: null,
      requiredNotices: null,
    },
    price: {
      salesPrice: row.Sales_Price || null,
      cashPortion: row.Cash_Portion || null,
      financeAmount: row.Finance_Amount || null,
    },
    financing: {
      thirdParty: toBoolean(row.Financing_Third_Party),
      loanAssumption: false, // Defaulting
      seller: false, // Defaulting
    },
    earnestMoney: {
      amount: row.Earnest_Money_Amount || null,
      escrowAgentName: row.Escrow_Agent_Name || null,
      // Defaulting these values
      escrowAgentAddress: { part1: null, part2: null },
      additionalAmount: null,
      additionalAmountDays: null,
    },
    optionFee: {
      amount: row.Option_Fee_Amount || null,
      days: row.Option_Period_Days || null,
    },
    titlePolicy: {
      companyName: row.Title_Company_Name || null,
      // Defaulting these values
      payer: null,
      shortageAmendment: { status: null, payer: null },
    },
    closing: {
      date: {
        monthDay: row.Closing_Date_MonthDay || null,
        year: row.Closing_Date_Year || null,
      },
    },
    specialProvisions: {
      text: row.Special_Provisions || null,
    },
    addenda: {
      hoa: toBoolean(row.Addendum_HOA),
      leadBasedPaint: toBoolean(row.Addendum_Lead_Based_Paint),
      // Defaulting other addenda
      thirdPartyFinancing: toBoolean(row.Financing_Third_Party),
      sellerFinancing: false,
      buyersTemporaryLease: false,
      loanAssumption: false,
      saleOfOtherProperty: false,
      mineralReservation: false,
      backupContract: false,
      coastalAreaProperty: false,
      hydrostaticTesting: false,
      lenderAppraisalTermination: false,
      environmentalAssessment: false,
      sellersTemporaryLease: false,
      shortSale: false,
      seawardOfGulfWaterway: false,
      propaneGasSystem: false,
      residentialLeases: false,
      fixtureLeases: false,
      section1031Exchange: false,
      improvementDistrict: false,
      otherText: { p1: null },
    },
    // Defaulting other top-level sections for completeness
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