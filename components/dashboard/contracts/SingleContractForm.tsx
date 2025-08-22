// components/dashboard/contracts/SingleContractForm.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trec14ContractData, Trec14Schema } from '@/lib/contracts/validation';
import { Loader2, FileText, Save, AlertCircle } from 'lucide-react';

// Import all sectional components
import { PartiesSection } from './PartiesSection';
import { PropertySection } from './PropertySection';
import { PriceSection } from './PriceSection';
import { FinancingAndLeasesSection } from './FinancingAndLeasesSection';
import { EarnestMoneyOptionFeeSection } from './EarnestMoneyOptionFeeSection';
import { TitlePolicySurveySection } from './TitlePolicySurveySection';
import { PropertyConditionBrokersSection } from './PropertyConditionBrokersSection';
import { ClosingAndAddendaSection } from './ClosingAndAddendaSection';
import { handleSingleContractSubmission } from '@/app/(dashboard)/dashboard/contracts/actions';

// Initialize the form state with the full structure.
// We initialize nested objects to ensure child components can access them safely.
// We use Partial<Trec14ContractData> as the form is built progressively.
const initialFormData: Partial<Trec14ContractData> = {
    parties: {},
    property: { exclusions: {}, hoaStatus: null },
    price: {},
    financing: { thirdParty: false, loanAssumption: false, seller: false },
    leases: { isResidential: false, isFixture: false, isNaturalResource: false },
    earnestMoney: { escrowAgentAddress: {} },
    optionFee: {},
    titlePolicy: { shortageAmendment: {} },
    survey: { existing: {} },
    objections: {},
    propertyCondition: { sellerDisclosure: {}, repairsList: {} },
    brokers: { listing: { associate: {} }, other: { associate: {} } },
    closing: { date: {} },
    possession: {},
    specialProvisions: {},
    settlement: { sellerContributionToOther: {} },
    notices: { buyer: { contactInfo: {} }, seller: { contactInfo: {} } },
    addenda: { otherText: {} },
    attorneys: { buyer: {}, seller: {} },
    execution: {},
};

export const SingleContractForm = () => {
  // State management for the entire contract data object.
  const [formData, setFormData] = useState<Partial<Trec14ContractData>>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI-specific state for the "and/or assigns" checkbox.
  const [andOrAssigns, setAndOrAssigns] = useState(false);

  /**
   * Centralized state update handler (Prop-Drilling Strategy).
   * This generic function allows updating any nested field in the state structure immutably.
   */
  const updateField = <S extends keyof Trec14ContractData, K extends keyof Trec14ContractData[S]>(
    section: S,
    field: K,
    value: Trec14ContractData[S][K]
  ) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...(prevData[section] as Trec14ContractData[S]),
        [field]: value,
      },
    }));
  };

  // Placeholder function for the "Save for future use" requirement
  const handleSaveDefaults = () => {
    alert('Save defaults feature placeholder.');
  };

  const handleGenerateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setFormErrors({});
    setErrorMessage(null);

    // 1. Prepare the final data. Merge the UI state (andOrAssigns).
    const submissionData = JSON.parse(JSON.stringify(formData));

    if (andOrAssigns && submissionData.parties && submissionData.parties.buyer) {
        const suffix = ' and/or assigns';
        if (!submissionData.parties.buyer.toLowerCase().includes(suffix)) {
            submissionData.parties.buyer = `${submissionData.parties.buyer}${suffix}`;
        }
    }

    // 2. Client-side validation (Pre-check before calling server action)
    const validationResult = Trec14Schema.safeParse(submissionData);

    if (!validationResult.success) {
        console.error("Validation Failed:", validationResult.error.flatten().fieldErrors);
        setFormErrors(validationResult.error.flatten().fieldErrors);
        setErrorMessage("Please review the form. Some fields are missing or invalid.");
        setIsGenerating(false);
        window.scrollTo(0, 0);
        return;
    }

    // 3. Call the Server Action
    try {
        const result = await handleSingleContractSubmission(validationResult.data);

        if (result.success && result.pdfBytes) {
            // Handle the PDF download on the client side
            // Convert the number array back to Uint8Array
            const pdfBytesUint8 = new Uint8Array(result.pdfBytes);
            const blob = new Blob([pdfBytesUint8], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Use the filename provided by the server
            link.download = result.fileName || 'Generated_Contract.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } else {
            console.error("Server Error:", result.error);
            setErrorMessage(result.error || "An unknown error occurred during contract generation.");
            window.scrollTo(0, 0);
        }
    } catch (error) {
        console.error("Network or unexpected error:", error);
        setErrorMessage("An unexpected error occurred while submitting the contract.");
        window.scrollTo(0, 0);
    } finally {
        setIsGenerating(false);
    }
  };

  // Helper to safely access nested state parts, defaulting to initialized objects.
  const getSectionData = <K extends keyof Trec14ContractData>(key: K): Trec14ContractData[K] => {
    // We cast here because we ensure initialization in initialFormData
    return (formData[key] || initialFormData[key]) as Trec14ContractData[K];
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 bg-background text-foreground">
      <header className="mb-10 flex justify-between items-center">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold">New TREC 1-4 Family Contract</h1>
            <p className="text-lg text-muted-foreground mt-2">
                Follow the guided questionnaire to generate your contract.
            </p>
        </div>
        <Button variant="outline" onClick={handleSaveDefaults} size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Defaults
        </Button>
      </header>

      {/* Display validation or server errors if any */}
      {errorMessage && (
        <div className="mb-8 p-4 border border-destructive rounded-lg bg-destructive/10 text-destructive flex items-start space-x-3" role="alert">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
                <h3 className="font-bold">Error:</h3>
                <p className="text-sm">{errorMessage}</p>
                {Object.keys(formErrors).length > 0 && (
                    <p className="text-xs mt-2">Scroll down to review specific fields (Note: Detailed field error highlighting is not implemented in this MVP).</p>
                )}
            </div>
        </div>
      )}

      <form onSubmit={handleGenerateContract} className="space-y-8">
        {/* Section 1: Parties */}
        <PartiesSection 
            formData={getSectionData('parties')} 
            updateField={(field, value) => updateField('parties', field, value)}
            andOrAssigns={andOrAssigns}
            setAndOrAssigns={setAndOrAssigns}
        />

        {/* Section 2: Property */}
        <PropertySection
            formData={getSectionData('property')}
            updateField={(field, value) => updateField('property', field, value)}
        />

        {/* Section 3: Price */}
        <PriceSection
            formData={getSectionData('price')}
            updateField={(field, value) => updateField('price', field, value)}
        />

        {/* Section 4: Financing & Leases */}
        <FinancingAndLeasesSection
            financingData={getSectionData('financing')}
            leasesData={getSectionData('leases')}
            updateFinancingField={(field, value) => updateField('financing', field, value)}
            updateLeasesField={(field, value) => updateField('leases', field, value)}
        />

        {/* Section 5: Earnest Money & Option Fee */}
        <EarnestMoneyOptionFeeSection
            earnestMoneyData={getSectionData('earnestMoney')}
            optionFeeData={getSectionData('optionFee')}
            updateEarnestMoneyField={(field, value) => updateField('earnestMoney', field, value)}
            updateOptionFeeField={(field, value) => updateField('optionFee', field, value)}
        />

        {/* Section 6: Title Policy & Survey */}
        <TitlePolicySurveySection
            titlePolicyData={getSectionData('titlePolicy')}
            surveyData={getSectionData('survey')}
            updateTitlePolicyField={(field, value) => updateField('titlePolicy', field, value)}
            updateSurveyField={(field, value) => updateField('survey', field, value)}
        />

        {/* Section 7: Property Condition & Brokers */}
        <PropertyConditionBrokersSection
            propertyConditionData={getSectionData('propertyCondition')}
            brokersData={getSectionData('brokers')}
            updatePropertyConditionField={(field, value) => updateField('propertyCondition', field, value)}
            updateBrokersField={(field, value) => updateField('brokers', field, value)}
        />

        {/* Section 8: Closing & Addenda */}
        <ClosingAndAddendaSection
            closingData={getSectionData('closing')}
            addendaData={getSectionData('addenda')}
            updateClosingField={(field, value) => updateField('closing', field, value)}
            updateAddendaField={(field, value) => updateField('addenda', field, value)}
        />

        {/* Submission Button */}
        <div className="mt-12 flex justify-end border-t pt-8">
            <Button
            type="submit"
            disabled={isGenerating}
            size="lg"
            // Uses the 'primary' variant (Warm Tan #D9A168)
            className="font-bold py-3 px-8 text-lg shadow-md"
            >
            {isGenerating ? (
                <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
                </>
            ) : (
                <>
                <FileText className="mr-2 h-5 w-5" />
                Generate Contract PDF (1 Credit)
                </>
            )}
            </Button>
        </div>
      </form>
    </div>
  );
};