// components/dashboard/contracts/TitlePolicySurveySection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trec14ContractData } from "@/lib/contracts/validation";

type TitlePolicyDataType = Trec14ContractData['titlePolicy'];
type SurveyDataType = Trec14ContractData['survey'];

interface TitlePolicySurveySectionProps {
  titlePolicyData: TitlePolicyDataType;
  surveyData: SurveyDataType;
  updateTitlePolicyField: <K extends keyof TitlePolicyDataType>(field: K, value: TitlePolicyDataType[K]) => void;
  updateSurveyField: <K extends keyof SurveyDataType>(field: K, value: SurveyDataType[K]) => void;
}

export const TitlePolicySurveySection = ({ 
    titlePolicyData, 
    surveyData, 
    updateTitlePolicyField,
    updateSurveyField
}: TitlePolicySurveySectionProps) => {

  // Helper functions to handle nested updates for Shortage Amendment
  const updateShortageAmendment = <K extends keyof TitlePolicyDataType['shortageAmendment']>(
    field: K, 
    value: TitlePolicyDataType['shortageAmendment'][K]
  ) => {
    // Ensure we maintain existing values while updating the specific field
    const updatedAmendment = {
        ...(titlePolicyData.shortageAmendment || {}),
        [field]: value
    };
    updateTitlePolicyField('shortageAmendment', updatedAmendment);
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">6. Title Policy & Survey</CardTitle>
        <CardDescription>Determine responsibility for the title policy and survey.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Title Policy Payer */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Title Policy</h3>
            <div className="space-y-3">
                <Label>Who pays for the Title Policy?</Label>
                <RadioGroup 
                    value={titlePolicyData.payer || undefined} 
                    onValueChange={(value) => updateTitlePolicyField('payer', value as TitlePolicyDataType['payer'])}
                    className="flex space-x-6"
                >
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Seller" id="title-seller" />
                        <Label htmlFor="title-seller" className="cursor-pointer">Seller Pays</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Buyer" id="title-buyer" />
                        <Label htmlFor="title-buyer" className="cursor-pointer">Buyer Pays</Label>
                    </div>
                </RadioGroup>
            </div>
            <div className="pt-2 max-w-md">
                <Label htmlFor="titleCompanyName">Title Company Name (Optional)</Label>
                <Input 
                    id="titleCompanyName" 
                    className="bg-background mt-1"
                    value={titlePolicyData.companyName || ''} 
                    onChange={(e) => updateTitlePolicyField('companyName', e.target.value)}
                />
            </div>
        </div>

        {/* Shortage Amendment */}
        <div className="space-y-4 p-4 border rounded-lg bg-background/50">
            <h3 className="text-lg font-semibold">Shortage Amendment (Exceptions)</h3>
            <div className="space-y-3">
                <Label>Will the standard exception as to discrepancies, conflicts, or shortages be amended?</Label>
                <RadioGroup 
                    value={titlePolicyData.shortageAmendment?.status || undefined} 
                    onValueChange={(value) => updateShortageAmendment('status', value as any)}
                    className="flex space-x-6"
                >
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="shall_be_amended" id="shortage-yes" />
                        <Label htmlFor="shortage-yes" className="cursor-pointer">Yes (Amended)</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <RadioGroupItem value="will_not_be_amended" id="shortage-no" />
                        <Label htmlFor="shortage-no" className="cursor-pointer">No (Not Amended)</Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Conditionally show payer if amended */}
            {titlePolicyData.shortageAmendment?.status === 'shall_be_amended' && (
                <div className="space-y-3 pt-4 pl-4 border-l-4 border-primary">
                    <Label>Who pays the cost of the amendment?</Label>
                    <RadioGroup 
                        value={titlePolicyData.shortageAmendment?.payer || undefined} 
                        onValueChange={(value) => updateShortageAmendment('payer', value as any)}
                        className="flex space-x-6"
                    >
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="Seller" id="shortage-payer-seller" />
                            <Label htmlFor="shortage-payer-seller" className="cursor-pointer">Seller</Label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="Buyer" id="shortage-payer-buyer" />
                            <Label htmlFor="shortage-payer-buyer" className="cursor-pointer">Buyer</Label>
                        </div>
                    </RadioGroup>
                </div>
            )}
        </div>

        {/* Survey Status */}
        <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-semibold">Survey Status</h3>
            <RadioGroup 
                value={surveyData.status || undefined} 
                onValueChange={(value) => updateSurveyField('status', value as SurveyDataType['status'])}
                className="space-y-3"
            >
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="existing_survey_provided" id="survey-existing" />
                    <Label htmlFor="survey-existing" className="cursor-pointer">Existing Survey Provided by Seller</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="new_survey_ordered" id="survey-new-ordered" />
                    <Label htmlFor="survey-new-ordered" className="cursor-pointer">New Survey Ordered by Buyer</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="new_survey_by_seller" id="survey-new-seller" />
                    <Label htmlFor="survey-new-seller" className="cursor-pointer">New Survey Provided by Seller</Label>
                </div>
            </RadioGroup>
        </div>

      </CardContent>
    </Card>
  );
};