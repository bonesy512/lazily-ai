// lib/contracts/validation.ts

import { z } from 'zod';

// This Zod schema represents the single source of truth for validating
// all incoming TREC 1-4 contract data, whether from a CSV or a future web form.
// It is meticulously structured to match the trec-1-4-data.json model.

export const Trec14Schema = z.object({
  parties: z.object({
    seller: z.string().optional().nullable(),
    buyer: z.string().optional().nullable(),
  }),
  property: z.object({
    lot: z.string().optional().nullable(),
    block: z.string().optional().nullable(),
    addition: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    county: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    exclusions: z.object({
      part1: z.string().optional().nullable(),
      part2: z.string().optional().nullable(),
    }),
    hoaStatus: z.enum(['is', 'is not']).optional().nullable(),
    requiredNotices: z.string().optional().nullable(),
  }),
  price: z.object({
    cashPortion: z.string().optional().nullable(),
    financeAmount: z.string().optional().nullable(),
    salesPrice: z.string().optional().nullable(),
  }),
  financing: z.object({
    thirdParty: z.boolean().optional(),
    loanAssumption: z.boolean().optional(),
    seller: z.boolean().optional(),
  }),
  leases: z.object({
    isResidential: z.boolean().optional(),
    isFixture: z.boolean().optional(),
    isNaturalResource: z.boolean().optional(),
    naturalResourceTerminationDays: z.string().optional().nullable(),
    naturalResourceDeliveryStatus: z.enum(['has been delivered', 'will not be delivered']).optional().nullable(),
  }),
  earnestMoney: z.object({
    escrowAgentName: z.string().optional().nullable(),
    escrowAgentAddress: z.object({
      part1: z.string().optional().nullable(),
      part2: z.string().optional().nullable(),
    }),
    amount: z.string().optional().nullable(),
    additionalAmount: z.string().optional().nullable(),
    additionalAmountDays: z.string().optional().nullable(),
  }),
  optionFee: z.object({
    amount: z.string().optional().nullable(),
    days: z.string().optional().nullable(),
  }),
  titlePolicy: z.object({
    companyName: z.string().optional().nullable(),
    payer: z.enum(['Seller', 'Buyer']).optional().nullable(),
    shortageAmendment: z.object({
      status: z.enum(['shall be amended', 'will not be amended']).optional().nullable(),
      payer: z.enum(['Seller', 'Buyer']).optional().nullable(),
    }),
  }),
  survey: z.object({
    status: z.enum(["Buyer's Expense", "Seller's Expense"]).optional().nullable(),
    existing: z.object({
      deliveryDays: z.string().optional().nullable(),
      affidavitPayer: z.enum(['Seller', 'Buyer']).optional().nullable(),
    }),
    new: z.object({
      deliveryDays: z.string().optional().nullable(),
    }),
    newBySeller: z.object({
      deliveryDays: z.string().optional().nullable(),
    }),
  }),
  objections: z.object({
    prohibitedUseActivity: z.string().optional().nullable(),
    objectionDays: z.string().optional().nullable(),
  }),
  propertyCondition: z.object({
    sellerDisclosure: z.object({
      status: z.enum(['has been received', 'has not been received']).optional().nullable(),
      deliveryDays: z.string().optional().nullable(),
    }),
    acceptanceStatus: z.enum(['as is', 'as is with repairs']).optional().nullable(),
    repairsList: z.object({
      part1: z.string().optional().nullable(),
      part2: z.string().optional().nullable(),
    }),
  }),
  serviceContract: z.object({
    maxCost: z.string().optional().nullable(),
  }),
  brokers: z.object({
    listing: z.object({
      associate: z.object({
        name: z.string().optional().nullable(),
        licenseNo: z.string().optional().nullable(),
        teamName: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
      }),
      represents: z.enum(["Seller as Seller's agent", "Seller and Buyer as an intermediary"]).optional().nullable(),
      firmName: z.string().optional().nullable(),
      firmLicenseNo: z.string().optional().nullable(),
      supervisor: z.object({
        name: z.string().optional().nullable(),
        licenseNo: z.string().optional().nullable(),
      }),
      address: z.object({
        street: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zip: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
      }),
    }),
    other: z.object({
      firmName: z.string().optional().nullable(),
      firmLicenseNo: z.string().optional().nullable(),
      represents: z.enum(["Buyer as Buyer's agent", "Seller as Listing Broker's subagent"]).optional().nullable(),
      associate: z.object({
        name: z.string().optional().nullable(),
        licenseNo: z.string().optional().nullable(),
        teamName: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
      }),
      supervisor: z.object({
        name: z.string().optional().nullable(),
        licenseNo: z.string().optional().nullable(),
      }),
      address: z.object({
        street: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zip: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
      }),
    }),
    disclosure: z.object({
      fee: z.object({
        dollarAmount: z.string().optional().nullable(),
        percentage: z.string().optional().nullable(),
        type: z.enum(['dollarAmount', 'percentage']).optional().nullable(),
      }),
    }),
  }),
  closing: z.object({
    date: z.object({
      monthDay: z.string().optional().nullable(),
      year: z.string().optional().nullable(),
    }),
  }),
  possession: z.object({
    status: z.enum(['closing and funding', 'according to lease']).optional().nullable(),
  }),
  specialProvisions: z.object({
    text: z.string().optional().nullable(),
  }),
  settlement: z.object({
    sellerContributionToBrokerage: z.object({
      type: z.enum(['dollarAmount', 'percentage']).optional().nullable(),
      dollarAmount: z.string().optional().nullable(),
      percentage: z.string().optional().nullable(),
    }),
    sellerContributionToOther: z.object({
      amount: z.string().optional().nullable(),
    }),
  }),
  notices: z.object({
    buyer: z.object({
      contactInfo: z.object({
        part1: z.string().optional().nullable(),
        part2: z.string().optional().nullable(),
      }),
      phone: z.string().optional().nullable(),
      emailFax: z.object({
        '1': z.string().optional().nullable(),
        '2': z.string().optional().nullable(),
      }),
    }),
    seller: z.object({
      contactInfo: z.object({
        part1: z.string().optional().nullable(),
        part2: z.string().optional().nullable(),
      }),
      phone: z.string().optional().nullable(),
      emailFax: z.object({
        '1': z.string().optional().nullable(),
        '2': z.string().optional().nullable(),
      }),
    }),
  }),
  addenda: z.object({
    thirdPartyFinancing: z.boolean().optional(),
    sellerFinancing: z.boolean().optional(),
    hoa: z.boolean().optional(),
    buyersTemporaryLease: z.boolean().optional(),
    loanAssumption: z.boolean().optional(),
    saleOfOtherProperty: z.boolean().optional(),
    mineralReservation: z.boolean().optional(),
    backupContract: z.boolean().optional(),
    coastalAreaProperty: z.boolean().optional(),
    hydrostaticTesting: z.boolean().optional(),
    lenderAppraisalTermination: z.boolean().optional(),
    environmentalAssessment: z.boolean().optional(),
    sellersTemporaryLease: z.boolean().optional(),
    shortSale: z.boolean().optional(),
    seawardOfGulfWaterway: z.boolean().optional(),
    leadBasedPaint: z.boolean().optional(),
    propaneGasSystem: z.boolean().optional(),
    residentialLeases: z.boolean().optional(),
    fixtureLeases: z.boolean().optional(),
    section1031Exchange: z.boolean().optional(),
    improvementDistrict: z.boolean().optional(),
    otherText: z.object({
      p1: z.string().optional().nullable(),
    }),
  }),
  attorneys: z.object({
    buyer: z.object({
      name: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      fax: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
    }),
    seller: z.object({
      name: z.string().optional().nullable(),
      phone: z.string().optional().nullable(),
      fax: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
    }),
  }),
  execution: z.object({
    day: z.string().optional().nullable(),
    month: z.string().optional().nullable(),
    year: z.string().optional().nullable(),
  }),
});

// We can also infer the TypeScript type directly from the schema
export type Trec14ContractData = z.infer<typeof Trec14Schema>;
