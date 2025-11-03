import { z } from 'zod';

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
    hoaStatus: z.enum(['is_subject', 'not_subject']).optional().nullable(),
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
    naturalResourceDeliveryStatus: z.enum(['has_been_delivered', 'will_not_be_delivered']).optional().nullable(),
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
      status: z.enum(['shall_be_amended', 'will_not_be_amended']).optional().nullable(),
      payer: z.enum(['Seller', 'Buyer']).optional().nullable(),
    }),
  }),
  survey: z.object({
    status: z.enum(['existing_survey_provided', 'new_survey_ordered', 'new_survey_by_seller']).optional().nullable(),
    existing: z.object({
      deliveryDays: z.string().optional().nullable(),
      affidavitPayer: z.enum(['seller', 'buyer']).optional().nullable(),
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
      status: z.enum(['received', 'not_received', 'not_required']).optional().nullable(),
      deliveryDays: z.string().optional().nullable(),
    }),
    acceptanceStatus: z.enum(['as_is', 'as_is_with_repairs']).optional().nullable(),
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
      represents: z.enum(["seller_agent", "intermediary"]).optional().nullable(),
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
      represents: z.enum(["buyer_agent", "seller_subagent"]).optional().nullable(),
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
    // --- ADDED a new object for the 'Selling Associate' fields ---
    selling: z.object({
        associate: z.object({
            name: z.string().optional().nullable(),
            licenseNo: z.string().optional().nullable(),
            teamName: z.string().optional().nullable(),
            email: z.string().optional().nullable(),
            phone: z.string().optional().nullable()
        }).optional(),
        supervisor: z.object({
            name: z.string().optional().nullable(),
            licenseNo: z.string().optional().nullable()
        }).optional(),
        address: z.object({
            street: z.string().optional().nullable(),
            city: z.string().optional().nullable(),
            state: z.string().optional().nullable(),
            zip: z.string().optional().nullable()
        }).optional()
    }).optional().nullable(),
    disclosure: z.object({
      fee: z.object({
        dollarAmount: z.string().optional().nullable(),
        percentage: z.string().optional().nullable(),
        type: z.enum(['dollar_amount', 'percentage']).optional().nullable(),
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
    status: z.enum(['upon_closing', 'temporary_lease']).optional().nullable(),
  }),
  specialProvisions: z.object({
    text: z.string().optional().nullable(),
  }),
  settlement: z.object({
    sellerContributionToBrokerage: z.object({
      type: z.enum(['dollar_amount', 'percentage']).optional().nullable(),
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
    // --- ADDED agent-specific notice fields ---
    buyerAgent: z.object({ contactInfo: z.string().optional().nullable() }).optional().nullable(),
    sellerAgent: z.object({ contactInfo: z.string().optional().nullable() }).optional().nullable(),
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

export type Trec14ContractData = z.infer<typeof Trec14Schema>;