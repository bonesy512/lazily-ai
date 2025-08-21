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
      exclusions: {
        part1: row['property.exclusions.part1'] || null,
        part2: row['property.exclusions.part2'] || null,
      },
      hoaStatus: (row['property.hoaStatus'] as any) || null,
      requiredNotices: row['property.requiredNotices'] || null,
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
      naturalResourceTerminationDays: row['leases.naturalResourceTerminationDays'] || null,
      naturalResourceDeliveryStatus: (row['leases.naturalResourceDeliveryStatus'] as any) || null,
    },
    earnestMoney: {
      escrowAgentName: row['earnestMoney.escrowAgentName'] || null,
      escrowAgentAddress: {
        part1: row['earnestMoney.escrowAgentAddress.part1'] || null,
        part2: row['earnestMoney.escrowAgentAddress.part2'] || null,
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
      payer: (row['titlePolicy.payer'] as any) || null,
      shortageAmendment: {
        status: (row['titlePolicy.shortageAmendment.status'] as any) || null,
        payer: (row['titlePolicy.shortageAmendment.payer'] as any) || null,
      },
    },
    survey: {
      status: (row['survey.status'] as any) || null,
      existing: {
        deliveryDays: row['survey.existing.deliveryDays'] || null,
        affidavitPayer: (row['survey.existing.affidavitPayer'] as any) || null,
      },
      new: {
        deliveryDays: row['survey.new.deliveryDays'] || null,
      },
      newBySeller: {
        deliveryDays: row['survey.newBySeller.deliveryDays'] || null,
      },
    },
    objections: {
      prohibitedUseActivity: row['objections.prohibitedUseActivity'] || null,
      objectionDays: row['objections.objectionDays'] || null,
    },
    propertyCondition: {
      sellerDisclosure: {
        status: (row['propertyCondition.sellerDisclosure.status'] as any) || null,
        deliveryDays: row['propertyCondition.sellerDisclosure.deliveryDays'] || null,
      },
      acceptanceStatus: (row['propertyCondition.acceptanceStatus'] as any) || null,
      repairsList: {
        part1: row['propertyCondition.repairsList.part1'] || null,
        part2: row['propertyCondition.repairsList.part2'] || null,
      },
    },
    serviceContract: {
      maxCost: row['serviceContract.maxCost'] || null,
    },
    brokers: {
      listing: {
        associate: {
          name: row['brokers.listing.associate.name'] || null,
          licenseNo: row['brokers.listing.associate.licenseNo'] || null,
          teamName: row['brokers.listing.associate.teamName'] || null,
          email: row['brokers.listing.associate.email'] || null,
          phone: row['brokers.listing.associate.phone'] || null,
        },
        represents: (row['brokers.listing.represents'] as any) || null,
        firmName: row['brokers.listing.firmName'] || null,
        firmLicenseNo: row['brokers.listing.firmLicenseNo'] || null,
        supervisor: {
          name: row['brokers.listing.supervisor.name'] || null,
          licenseNo: row['brokers.listing.supervisor.licenseNo'] || null,
        },
        address: {
          street: row['brokers.listing.address.street'] || null,
          city: row['brokers.listing.address.city'] || null,
          state: row['brokers.listing.address.state'] || null,
          zip: row['brokers.listing.address.zip'] || null,
          phone: row['brokers.listing.address.phone'] || null,
        },
      },
      other: {
        firmName: row['brokers.other.firmName'] || null,
        firmLicenseNo: row['brokers.other.firmLicenseNo'] || null,
        represents: (row['brokers.other.represents'] as any) || null,
        associate: {
          name: row['brokers.other.associate.name'] || null,
          licenseNo: row['brokers.other.associate.licenseNo'] || null,
          teamName: row['brokers.other.associate.teamName'] || null,
          email: row['brokers.other.associate.email'] || null,
          phone: row['brokers.other.associate.phone'] || null,
        },
        supervisor: {
          name: row['brokers.other.supervisor.name'] || null,
          licenseNo: row['brokers.other.supervisor.licenseNo'] || null,
        },
        address: {
          street: row['brokers.other.address.street'] || null,
          city: row['brokers.other.address.city'] || null,
          state: row['brokers.other.address.state'] || null,
          zip: row['brokers.other.address.zip'] || null,
          phone: row['brokers.other.address.phone'] || null,
        },
      },
      disclosure: {
        fee: {
          dollarAmount: row['brokers.disclosure.fee.dollarAmount'] || null,
          percentage: row['brokers.disclosure.fee.percentage'] || null,
          type: (row['brokers.disclosure.fee.type'] as any) || null,
        },
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
      sellerContributionToBrokerage: {
        type: (row['settlement.sellerContributionToBrokerage.type'] as any) || null,
        dollarAmount: row['settlement.sellerContributionToBrokerage.dollarAmount'] || null,
        percentage: row['settlement.sellerContributionToBrokerage.percentage'] || null,
      },
      sellerContributionToOther: {
        amount: row['settlement.sellerContributionToOther.amount'] || null,
      },
    },
    notices: {
      buyer: {
        contactInfo: {
          part1: row['notices.buyer.contactInfo.part1'] || null,
          part2: row['notices.buyer.contactInfo.part2'] || null,
        },
        phone: row['notices.buyer.phone'] || null,
        emailFax: {
          '1': row['notices.buyer.emailFax.1'] || null,
          '2': row['notices.buyer.emailFax.2'] || null,
        },
      },
      seller: {
        contactInfo: {
          part1: row['notices.seller.contactInfo.part1'] || null,
          part2: row['notices.seller.contactInfo.part2'] || null,
        },
        phone: row['notices.seller.phone'] || null,
        emailFax: {
          '1': row['notices.seller.emailFax.1'] || null,
          '2': row['notices.seller.emailFax.2'] || null,
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
      mineralReservation: toBoolean(row['addenda.mineralReservation']),
      backupContract: toBoolean(row['addenda.backupContract']),
      coastalAreaProperty: toBoolean(row['addenda.coastalAreaProperty']),
      hydrostaticTesting: toBoolean(row['addenda.hydrostaticTesting']),
      lenderAppraisalTermination: toBoolean(row['addenda.lenderAppraisalTermination']),
      environmentalAssessment: toBoolean(row['addenda.environmentalAssessment']),
      sellersTemporaryLease: toBoolean(row['addenda.sellersTemporaryLease']),
      shortSale: toBoolean(row['addenda.shortSale']),
      seawardOfGulfWaterway: toBoolean(row['addenda.seawardOfGulfWaterway']),
      leadBasedPaint: toBoolean(row['addenda.leadBasedPaint']),
      propaneGasSystem: toBoolean(row['addenda.propaneGasSystem']),
      residentialLeases: toBoolean(row['addenda.residentialLeases']),
      fixtureLeases: toBoolean(row['addenda.fixtureLeases']),
      section1031Exchange: toBoolean(row['addenda.section1031Exchange']),
      improvementDistrict: toBoolean(row['addenda.improvementDistrict']),
      otherText: {
        p1: row['addenda.otherText.p1'] || null,
      },
    },
    attorneys: {
      buyer: {
        name: row['attorneys.buyer.name'] || null,
        phone: row['attorneys.buyer.phone'] || null,
        fax: row['attorneys.buyer.fax'] || null,
        email: row['attorneys.buyer.email'] || null,
      },
      seller: {
        name: row['attorneys.seller.name'] || null,
        phone: row['attorneys.seller.phone'] || null,
        fax: row['attorneys.seller.fax'] || null,
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