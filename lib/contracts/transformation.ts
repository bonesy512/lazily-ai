// lib/contracts/transformation.ts

import { Trec14ContractData } from "./validation";

const toBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false;
  return ['true', 'yes', '1'].includes(value.toLowerCase());
};

export const mapCsvRowToJson = (row: Record<string, string>): Trec14ContractData => {
  return {
    parties: {
      seller: row['parties.seller'],
      buyer: row['parties.buyer'],
    },
    property: {
      lot: row['property.lot'],
      block: row['property.block'],
      addition: row['property.addition'],
      city: row['property.city'],
      county: row['property.county'],
      address: row['property.address'],
      hoaStatus: row['property.hoaStatus'] as Trec14ContractData['property']['hoaStatus'],
    },
    price: {
      cashPortion: row['price.cashPortion'],
      financeAmount: row['price.financeAmount'],
      salesPrice: row['price.salesPrice'],
    },
    financing: {
      thirdParty: toBoolean(row['financing.thirdParty']),
    },
    earnestMoney: {
      amount: row['earnestMoney.amount'],
      escrowAgentName: row['earnestMoney.escrowAgentName'],
    },
    optionFee: {
      amount: row['optionFee.amount'],
      days: row['optionFee.days'],
    },
    titlePolicy: {
      payer: row['titlePolicy.payer'] as Trec14ContractData['titlePolicy']['payer'],
    },
    survey: {
      status: row['survey.status'] as Trec14ContractData['survey']['status'],
    },
    propertyCondition: {
      sellerDisclosure: {
        status: row['propertyCondition.sellerDisclosure.status'] as Trec14ContractData['propertyCondition']['sellerDisclosure']['status'],
      },
      acceptanceStatus: row['propertyCondition.acceptanceStatus'] as Trec14ContractData['propertyCondition']['acceptanceStatus'],
    },
    brokers: {
        listing: { represents: row['brokers.listing.represents'] as Trec14ContractData['brokers']['listing']['represents'] },
        other: { represents: row['brokers.other.represents'] as Trec14ContractData['brokers']['other']['represents'] },
    },
    closing: {
      date: {
        monthDay: row['closing.date.monthDay'],
        year: row['closing.date.year'],
      },
    },
    possession: {
      status: row['possession.status'] as Trec14ContractData['possession']['status'],
    },
    specialProvisions: {
      text: row['specialProvisions.text'],
    },
  };
};