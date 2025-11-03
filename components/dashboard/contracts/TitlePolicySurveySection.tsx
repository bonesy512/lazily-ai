'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
  titlePolicyData: Trec14ContractData['titlePolicy'];
  surveyData: Trec14ContractData['survey'];
  updateTitlePolicyField: <K extends keyof Trec14ContractData['titlePolicy']>(field: K, value: Trec14ContractData['titlePolicy'][K]) => void;
  updateSurveyField: <K extends keyof Trec14ContractData['survey']>(field: K, value: Trec14ContractData['survey'][K]) => void;
}

export const TitlePolicySurveySection: React.FC<Props> = ({ titlePolicyData, surveyData, updateTitlePolicyField, updateSurveyField }) => {
  return (
    <Card>
      <CardHeader><CardTitle>6. Title Policy and Survey</CardTitle></CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="font-medium">Title Policy</Label>
          <p className="text-sm text-muted-foreground mb-4">Who will pay for the owner's title policy?</p>
          <RadioGroup value={titlePolicyData?.payer ?? undefined} onValueChange={(value) => updateTitlePolicyField('payer', value as 'Seller' | 'Buyer')} className="flex space-x-4">
            <div className="flex items-center space-x-2"><RadioGroupItem value="Seller" id="title-seller" /><Label htmlFor="title-seller">Seller</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="Buyer" id="title-buyer" /><Label htmlFor="title-buyer">Buyer</Label></div>
          </RadioGroup>
        </div>
        <div>
          <Label className="font-medium">Survey</Label>
          <p className="text-sm text-muted-foreground mb-4">How will the survey be handled?</p>
          <RadioGroup value={surveyData?.status ?? undefined} onValueChange={(value) => updateSurveyField('status', value as any)} className="space-y-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="existing_survey_provided" id="survey-existing" /><Label htmlFor="survey-existing">Use Seller's existing survey</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="new_survey_ordered" id="survey-new-buyer" /><Label htmlFor="survey-new-buyer">New survey at Buyer's expense</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="new_survey_by_seller" id="survey-new-seller" /><Label htmlFor="survey-new-seller">New survey at Seller's expense</Label></div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};