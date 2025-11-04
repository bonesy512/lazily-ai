// components/dashboard/contracts/SingleContractForm.tsx
'use client';

import { useState, useEffect, useActionState } from 'react';
import useSWR from 'swr';
import { Button } from "@/components/ui/button";
import { Trec14ContractData, Trec14Schema } from '@/lib/contracts/validation';
import { TeamContractDefaults } from '@/lib/db/schema';
import { ActionState } from '@/lib/auth/middleware';
import { Loader2, FileText, Save, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PartiesSection } from './PartiesSection';
import { PropertySection } from './PropertySection';
import { PriceSection } from './PriceSection';
import { FinancingAndLeasesSection } from './FinancingAndLeasesSection';
import { EarnestMoneyOptionFeeSection } from './EarnestMoneyOptionFeeSection';
import { TitlePolicySurveySection } from './TitlePolicySurveySection';
import { PropertyConditionSection } from './PropertyConditionSection';
import { BrokersSection } from './BrokersSection';
import { ClosingAndAddendaSection } from './ClosingAndAddendaSection';
import { NoticesAttorneysExecutionSection } from './NoticesAttorneysExecutionSection';

import { handleSingleContractSubmission } from '@/app/(dashboard)/dashboard/contracts/actions';
import { updateTeamDefaults } from '@/app/(dashboard)/dashboard/settings/actions';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const initialFormData: Trec14ContractData = {
    parties: { seller: null, buyer: null }, property: { lot: null, block: null, addition: null, city: null, county: null, address: null, exclusions: { part1: null, part2: null }, hoaStatus: null, requiredNotices: null }, price: { cashPortion: null, financeAmount: null, salesPrice: null }, financing: { thirdParty: false, loanAssumption: false, seller: false }, leases: { isResidential: false, isFixture: false, isNaturalResource: false, naturalResourceTerminationDays: null, naturalResourceDeliveryStatus: null }, earnestMoney: { escrowAgentName: null, escrowAgentAddress: { part1: null, part2: null }, amount: null, additionalAmount: null, additionalAmountDays: null }, optionFee: { amount: null, days: null }, titlePolicy: { companyName: null, payer: null, shortageAmendment: { status: null, payer: null } }, survey: { status: null, existing: { deliveryDays: null, affidavitPayer: null }, new: { deliveryDays: null }, newBySeller: { deliveryDays: null } }, objections: { prohibitedUseActivity: null, objectionDays: null }, propertyCondition: { sellerDisclosure: { status: null, deliveryDays: null }, acceptanceStatus: 'as_is', repairsList: { part1: null, part2: null } }, serviceContract: { maxCost: null }, brokers: { listing: { associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null }, represents: null, firmName: null, firmLicenseNo: null, supervisor: { name: null, licenseNo: null }, address: { street: null, city: null, state: null, zip: null, phone: null } }, other: { firmName: null, firmLicenseNo: null, represents: null, associate: { name: null, licenseNo: null, teamName: null, email: null, phone: null }, supervisor: { name: null, licenseNo: null }, address: { street: null, city: null, state: null, zip: null, phone: null } }, selling: { associate: {}, supervisor: {}, address: {} }, disclosure: { fee: { dollarAmount: null, percentage: null, type: null } } }, closing: { date: { monthDay: null, year: null } }, possession: { status: 'upon_closing' }, specialProvisions: { text: null }, settlement: { sellerContributionToBrokerage: { type: null, dollarAmount: null, percentage: null }, sellerContributionToOther: { amount: null } }, notices: { buyer: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } }, seller: { contactInfo: { part1: null, part2: null }, phone: null, emailFax: { '1': null, '2': null } }, buyerAgent: { contactInfo: null }, sellerAgent: { contactInfo: null } }, addenda: { thirdPartyFinancing: false, sellerFinancing: false, hoa: false, buyersTemporaryLease: false, loanAssumption: false, saleOfOtherProperty: false, mineralReservation: false, backupContract: false, coastalAreaProperty: false, hydrostaticTesting: false, lenderAppraisalTermination: false, environmentalAssessment: false, sellersTemporaryLease: false, shortSale: false, seawardOfGulfWaterway: false, leadBasedPaint: false, propaneGasSystem: false, residentialLeases: false, fixtureLeases: false, section1031Exchange: false, improvementDistrict: false, otherText: { p1: null } }, attorneys: { buyer: { name: null, phone: null, fax: null, email: null }, seller: { name: null, phone: null, fax: null, email: null } }, execution: { day: null, month: null, year: null },
};

export function SingleContractForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<Trec14ContractData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [andOrAssigns, setAndOrAssigns] = useState(false);
  const { data: defaults, isLoading: isLoadingDefaults } = useSWR<TeamContractDefaults>('/api/team/defaults', fetcher);
  const [saveState, saveAction, isSaving] = useActionState<ActionState, FormData>(updateTeamDefaults, {});

  useEffect(() => {
    if (defaults) {
      setFormData(prev => ({
        ...prev,
        brokers: {
          ...prev.brokers,
          listing: { ...prev.brokers.listing, firmName: defaults.listingFirmName ?? prev.brokers.listing.firmName, firmLicenseNo: defaults.listingFirmLicenseNo ?? prev.brokers.listing.firmLicenseNo, address: { ...prev.brokers.listing.address, street: defaults.listingBrokerAddress ?? prev.brokers.listing.address.street, }, associate: { ...prev.brokers.listing.associate, name: defaults.listingAssociateName ?? prev.brokers.listing.associate.name, licenseNo: defaults.listingAssociateLicenseNo ?? prev.brokers.listing.associate.licenseNo, email: defaults.listingAssociateEmail ?? prev.brokers.listing.associate.email, phone: defaults.listingAssociatePhone ?? prev.brokers.listing.associate.phone, }, supervisor: { ...prev.brokers.listing.supervisor, name: defaults.listingSupervisorName ?? prev.brokers.listing.supervisor.name, licenseNo: defaults.listingSupervisorLicenseNo ?? prev.brokers.listing.supervisor.licenseNo, } },
          other: { ...prev.brokers.other, firmName: defaults.otherFirmName ?? prev.brokers.other.firmName, firmLicenseNo: defaults.otherFirmLicenseNo ?? prev.brokers.other.firmLicenseNo, associate: { ...prev.brokers.other.associate, name: defaults.otherAssociateName ?? prev.brokers.other.associate.name, licenseNo: defaults.otherAssociateLicenseNo ?? prev.brokers.other.associate.licenseNo, } }
        },
        earnestMoney: { ...prev.earnestMoney, escrowAgentName: defaults.escrowAgentName ?? prev.earnestMoney.escrowAgentName, }
      }));
    }
  }, [defaults]);

  const updateField = <S extends keyof Trec14ContractData, K extends keyof Trec14ContractData[S]>(section: S, field: K, value: Trec14ContractData[S][K]) => {
    setFormData(prevData => ({ ...prevData, [section]: { ...(prevData[section] as object), [field]: value, }, }));
  };
  
  const updateBrokersField = (section: 'listing' | 'other' | 'selling', subSection: any, field: string, value: any) => {
    setFormData(prev => {
      const newBrokers = { ...prev.brokers };
      
      const defaultNestedProps = { associate: {}, supervisor: {}, address: {} };

      let targetSection = { 
        ...defaultNestedProps, 
        ...(newBrokers[section] || {}), 
      };
      
      if (typeof (targetSection as any)[subSection] === 'object' && (targetSection as any)[subSection] !== null) {
        (targetSection as any)[subSection] = { ...((targetSection as any)[subSection] as object), [field]: value, };
      } else { 
        (targetSection as any)[subSection] = value; 
      }
      
      newBrokers[section] = targetSection;
      return { ...prev, brokers: newBrokers };
    });
  };

  const handleGenerateContract = async (e: React.FormEvent) => {
    e.preventDefault(); setIsGenerating(true); setErrorMessage(null);
    const submissionData = JSON.parse(JSON.stringify(formData));
    if (andOrAssigns && submissionData.parties && submissionData.parties.buyer) {
        const suffix = ' and/or assigns';
        if (!submissionData.parties.buyer.toLowerCase().includes(suffix)) { submissionData.parties.buyer = `${submissionData.parties.buyer}${suffix}`; }
    }
    const validationResult = Trec14Schema.safeParse(submissionData);
    if (!validationResult.success) {
        console.error("Validation Failed:", validationResult.error.flatten()); setErrorMessage("Please review the form. Some fields are missing or invalid."); setIsGenerating(false); window.scrollTo(0, 0); return;
    }
    try {
        const result = await handleSingleContractSubmission(validationResult.data);
        // FIX APPLIED: Check only for result.success to correctly narrow the type
        if (result.success) {
             const pdfBytesUint8 = new Uint8Array(result.pdfBytes); 
             const blob = new Blob([pdfBytesUint8], { type: 'application/pdf' }); 
             const url = window.URL.createObjectURL(blob); 
             const link = document.createElement('a'); 
             link.href = url; 
             link.download = result.fileName || 'Generated_Contract.pdf'; 
             document.body.appendChild(link); 
             link.click(); 
             document.body.removeChild(link); 
             window.URL.revokeObjectURL(url); 
             router.push('/dashboard/contracts');
        } else {
            // TypeScript now correctly understands this is the { success: false, error: string } object
            console.error("Server Error:", result.error); 
            setErrorMessage(result.error || "An unknown error occurred."); 
            window.scrollTo(0, 0);
        }
    } catch (error) {
        console.error("Network or unexpected error:", error); setErrorMessage("An unexpected error occurred."); window.scrollTo(0, 0);
    } finally { setIsGenerating(false); }
  };

  const getSectionData = <K extends keyof Trec14ContractData>(key: K): Trec14ContractData[K] => formData[key];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 bg-background text-foreground">
      <header className="mb-10 flex justify-between items-center"><h1 className="text-3xl md:text-4xl font-bold">New TREC 1-4 Family Contract</h1></header>
      {errorMessage && (<div className="mb-8 p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive flex items-start space-x-3" role="alert"><AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" /><div><h3 className="font-bold">Error:</h3><p className="text-sm">{errorMessage}</p></div></div>)}
      {isLoadingDefaults && <p>Loading your saved defaults...</p>}
      <form onSubmit={handleGenerateContract} className="space-y-8">
        <PartiesSection formData={getSectionData('parties')} updateField={(f, v) => updateField('parties', f, v)} andOrAssigns={andOrAssigns} setAndOrAssigns={setAndOrAssigns} />
        <PropertySection formData={getSectionData('property')} updateField={(f, v) => updateField('property', f, v)} />
        <PriceSection formData={getSectionData('price')} updateField={(f, v) => updateField('price', f, v)} />
        <FinancingAndLeasesSection financingData={getSectionData('financing')} leasesData={getSectionData('leases')} updateFinancingField={(f, v) => updateField('financing', f, v)} updateLeasesField={(f, v) => updateField('leases', f, v)} />
        <EarnestMoneyOptionFeeSection earnestMoneyData={getSectionData('earnestMoney')} optionFeeData={getSectionData('optionFee')} updateEarnestMoneyField={(f, v) => updateField('earnestMoney', f, v)} updateOptionFeeField={(f, v) => updateField('optionFee', f, v)} />
        <TitlePolicySurveySection titlePolicyData={getSectionData('titlePolicy')} surveyData={getSectionData('survey')} updateTitlePolicyField={(f, v) => updateField('titlePolicy', f, v)} updateSurveyField={(f, v) => updateField('survey', f, v)} />
        <PropertyConditionSection propertyConditionData={getSectionData('propertyCondition')} specialProvisionsData={getSectionData('specialProvisions')} updatePropertyConditionField={(f, v) => updateField('propertyCondition', f, v)} updateSpecialProvisionsField={(f, v) => updateField('specialProvisions', f, v)} />
        <BrokersSection brokersData={getSectionData('brokers')} updateBrokersField={updateBrokersField} />
        <ClosingAndAddendaSection closingData={getSectionData('closing')} addendaData={getSectionData('addenda')} updateClosingField={(f, v) => updateField('closing', f, v)} updateAddendaField={(f, v) => updateField('addenda', f, v)} />
        
        <NoticesAttorneysExecutionSection
            noticesData={getSectionData('notices')}
            attorneysData={getSectionData('attorneys')}
            executionData={getSectionData('execution')}
            updateExecutionField={(field, value) => updateField('execution', field, value)}
            updateNoticesField={(section, field, value) => updateField('notices', section, { ...formData.notices[section], [field]: value })}
            updateAttorneysField={(section, field, value) => updateField('attorneys', section, { ...formData.attorneys[section], [field]: value })}
        />

        <div className="mt-12 flex justify-end border-t pt-8">
            <Button type="submit" disabled={isGenerating || isLoadingDefaults} size="lg" className="font-bold py-3 px-8 text-lg shadow-md">
            {isGenerating ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating...</>) : (<><FileText className="mr-2 h-5 w-5" />Generate Contract PDF (1 Credit)</>)}
            </Button>
        </div>
      </form>
    </div>
  );
}