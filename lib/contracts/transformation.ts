// lib/contracts/transformation.ts

import { Trec14ContractData } from "./validation";

const toBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false;
  const lowerCaseValue = value.toLowerCase();
  return lowerCaseValue === 'true' || lowerCaseValue === 'yes' || lowerCaseValue === '1';
};

// This function now exhaustively maps the new dot-notation CSV to the nested JSON structure.
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
      exclusions: {
        part1: row['property.exclusions.part1'] || null,
        part2: row['property.exclusions.part2'] || null,
      },
      hoaStatus: (row['property.hoaStatus'] as 'is' | 'is not') || null,
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
    },
    earnestMoney: {
      escrowAgentName: row['earnestMoney.escrowAgentName'] || null,
      escrowAgentAddress: {
        part1: row['earnestMoney.escrowAgentAddress.part1'] || null,
        part2: null
      },
      amount: row['earnestMoney.amount'] || null,
      additionalAmount: row['earnestMoney.additionalAmount'] || null,
      additionalAmountDays: row['earnestMoney.additionalAmountDays'] || null,
    },
    optionFee: {
      amount: row['optionFee.amount'] || null,
      days: row['optionFee.days'] || null,
    },
    titlePolicy: {
      companyName: row['titlePolicy.companyName'] || null,
      payer: (row['titlePolicy.payer'] as 'Seller' | 'Buyer') || null,
      shortageAmendment: {
        status: (row['titlePolicy.shortageAmendment.status'] as 'shall be amended' | 'will not be amended') || null,
        payer: (row['titlePolicy.shortageAmendment.payer'] as 'Seller' | 'Buyer') || null,
      },
    },
    survey: {
      status: (row['survey.status'] as "Buyer's Expense" | "Seller's Expense") || null,
    },
    objections: {
      objectionDays: row['objections.objectionDays'] || null,
    },
    propertyCondition: {
      sellerDisclosure: {
        status: (row['propertyCondition.sellerDisclosure.status'] as 'has been received' | 'has not been received') || null,
        deliveryDays: row['propertyCondition.sellerDisclosure.deliveryDays'] || null,
      },
      acceptanceStatus: (row['propertyCondition.acceptanceStatus'] as 'as is' | 'as is with repairs') || null,
      repairsList: {
        part1: row['propertyCondition.repairsList.part1'] || null,
        part2: null
      },
    },
    brokers: {
      listing: {
        associate: {
          name: row['brokers.listing.associate.name'] || null,
          licenseNo: row['brokers.listing.associate.licenseNo'] || null,
        },
        firmName: row['brokers.listing.firmName'] || null,
        firmLicenseNo: row['brokers.listing.firmLicenseNo'] || null,
      },
      other: {
        associate: {
          name: row['brokers.other.associate.name'] || null,
          licenseNo: row['brokers.other.associate.licenseNo'] || null,
        },
        firmName: row['brokers.other.firmName'] || null,
        firmLicenseNo: row['brokers.other.firmLicenseNo'] || null,
      },
    },
    closing: {
      date: {
        monthDay: row['closing.date.monthDay'] || null,
        year: row['closing.date.year'] || null,
      },
    },
    possession: {
      status: (row['possession.status'] as 'closing and funding' | 'according to lease') || null,
    },
    specialProvisions: {
      text: row['specialProvisions.text'] || null,
    },
    settlement: {
        sellerContributionToOther: {
            amount: row['settlement.sellerContributionToOther.amount'] || null,
        },
    },
    notices: {
      buyer: {
        contactInfo: {
          part1: row['notices.buyer.contactInfo.part1'] || null,
          part2: null
        },
      },
      seller: {
        contactInfo: {
          part1: row['notices.seller.contactInfo.part1'] || null,
          part2: null
        },
      },
    },
    addenda: {
      thirdPartyFinancing: toBoolean(row['addenda.thirdPartyFinancing']),
      sellerFinancing: toBoolean(row['addenda.sellerFinancing']),
      hoa: toBoolean(row['addenda.hoa']),
      buyersTemporaryLease: toBoolean(row['addenda.buyersTemporaryLease']),
      loanAssumption: toBoolean(row['addenda.loanAssumption']),
      saleOfOtherProperty: toBoolean(row['addenda.saleOfOtherProperty']),
      leadBasedPaint: toBoolean(row['addenda.leadBasedPaint']),
      sellersTemporaryLease: toBoolean(row['addenda.sellersTemporaryLease']),
      otherText: {
        p1: row['addenda.otherText.p1'] || null,
      },
    },
    attorneys: {
      buyer: {
        name: row['attorneys.buyer.name'] || null,
        phone: row['attorneys.buyer.phone'] || null,
        email: row['attorneys.buyer.email'] || null,
      },
      seller: {
        name: row['attorneys.seller.name'] || null,
        phone: row['attorneys.seller.phone'] || null,
        email: row['attorneys.seller.email'] || null,
      },
    },
    execution: {
      day: row['execution.day'] || null,
      month: row['execution.month'] || null,
      year: row['execution.year'] || null,
    },
  };
};