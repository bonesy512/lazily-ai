// lib/contracts/transformation.ts

import { Trec14ContractData } from "./validation";

const toBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false;
  return ['true', 'yes', '1'].includes(value.toLowerCase());
};

export const mapCsvRowToJson = (row: Record<string, string>): Trec14ContractData => {
  return {
    parties: {
      seller: row['parties.seller'] || null,
      buyer: row['parties.buyer'] || null,
    },
    property: {
      lot: row['property.lot'] || null,
      block: row['property.block'] || null,
      addition: row['property.addition'] || null,
      city: row['property.city'] || null,
      county: row['property.county'] || null,
      address: row['property.address'] || null,
      exclusions: { part1: null, part2: null }, // Added missing required field
      hoaStatus: (row['property.hoaStatus'] as any) || null,
      requiredNotices: null,
    },
    price: {
      cashPortion: row['price.cashPortion'] || null,
      financeAmount: row['price.financeAmount'] || null,
      salesPrice: row['price.salesPrice'] || null,
    },
    financing: {
      thirdParty: toBoolean(row['financing.thirdParty']),
      loanAssumption: toBoolean(row['financing.loanAssumption']),
      seller: toBoolean(row['financing.seller']),
    },
    leases: {
      isResidential: toBoolean(row['leases.isResidential']),
      isFixture: toBoolean(row['leases.isFixture']),
      isNaturalResource: toBoolean(row['leases.isNaturalResource']),
      naturalResourceTerminationDays: null,
      naturalResourceDeliveryStatus: null,
    },
    earnestMoney: {
      escrowAgentName: row['earnestMoney.escrowAgentName'] || null,
      escrowAgentAddress: { part1: null, part2: null },
      amount: row['earnestMoney.amount'] || null,
      additionalAmount: null,
      additionalAmountDays: null,
    },
    optionFee: {
      amount: row['optionFee.amount'] || null,
      days: row['optionFee.days'] || null,
    },
    titlePolicy: {
      companyName: null,
      payer: (row['titlePolicy.payer'] as any) || null,
      shortageAmendment: { status: null, payer: null },
    },
    survey: {
      status: (row['survey.status'] as any) || null,
      existing: { deliveryDays: null, affidavitPayer: null },
      new: { deliveryDays: null },
      newBySeller: { deliveryDays: null },
    },
    objections: {
      prohibitedUseActivity: null,
      objectionDays: null,
    },
    propertyCondition: {
      sellerDisclosure: {
        status: (row['propertyCondition.sellerDisclosure.status'] as any) || null,
        deliveryDays: null,
      },
      acceptanceStatus: (row['propertyCondition.acceptanceStatus'] as any) || null,
      repairsList: { part1: null, part2: null },
    },
    serviceContract: {
      maxCost: null,
    },
    brokers: {
      listing: {
        associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null },
        represents: (row['brokers.listing.represents'] as any) || null,
        firmName: null, firmLicenseNo: null,
        supervisor: { name: null, licenseNo: null },
        address: { street: null, city: null, state: null, zip: null, phone: null },
      },
      other: {
        firmName: null, firmLicenseNo: null,
        represents: (row['brokers.other.represents'] as any) || null,
        associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null },
        supervisor: { name: null, licenseNo: null },
        address: { street: null, city: null, state: null, zip: null, phone: null },
      },
      disclosure: {
        fee: { dollarAmount: null, percentage: null, type: null },
      },
    },
    closing: {
      date: {
        monthDay: row['closing.date.monthDay'] || null,
        year: row['closing.date.year'] || null,
      },
    },
    possession: {
      status: (row['possession.status'] as any) || null,
    },
    specialProvisions: {
      text: row['specialProvisions.text'] || null,
    },
    settlement: {
      sellerContributionToBrokerage: { type: null, dollarAmount: null, percentage: null },
      sellerContributionToOther: { amount: null },
    },
    notices: {
      buyer: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } },
      seller: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } },
    },
    addenda: {
      thirdPartyFinancing: false, sellerFinancing: false, hoa: false, buyersTemporaryLease: false,
      loanAssumption: false, saleOfOtherProperty: false, mineralReservation: false, backupContract: false,
      coastalAreaProperty: false, hydrostaticTesting: false, lenderAppraisalTermination: false,
      environmentalAssessment: false, sellersTemporaryLease: false, shortSale: false,
      seawardOfGulfWaterway: false, leadBasedPaint: false, propaneGasSystem: false,
      residentialLeases: false, fixtureLeases: false, section1031Exchange: false,
      improvementDistrict: false, otherText: { p1: null },
    },
    attorneys: {
      buyer: { name: null, phone: null, fax: null, email: null },
      seller: { name: null, phone: null, fax: null, email: null },
    },
    execution: {
      day: null, month: null, year: null,
    },
  };
};