'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

interface Props {
  titlePolicyData: Trec14ContractData['titlePolicy'];
  surveyData: Trec14ContractData['survey'];
  updateTitlePolicyField: <K extends keyof Trec14ContractData['titlePolicy']>(
    field: K,
    value: Trec14ContractData['titlePolicy'][K]
  ) => void;
  updateSurveyField: <K extends keyof Trec14ContractData['survey']>(
    field: K,
    value: Trec14ContractData['survey'][K]
  ) => void;
}

export const TitlePolicySurveySection: React.FC<Props> = ({
  titlePolicyData,
  surveyData,
  updateTitlePolicyField,
  updateSurveyField,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>6. Title Policy and Survey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Title Policy Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Title Policy</h3>
          <div className="space-y-2">
            <Label htmlFor="titlePolicyCompany">Title Company Name</Label>
            <Input
              id="titlePolicyCompany"
              placeholder="Same as Escrow Agent (e.g., Texas National Title)"
              value={titlePolicyData?.companyName ?? ''}
              onChange={(e) =>
                updateTitlePolicyField('companyName', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Who will pay for the owner's title policy?</Label>
            <RadioGroup
              value={titlePolicyData?.payer ?? undefined}
              onValueChange={(value) =>
                updateTitlePolicyField('payer', value as 'Seller' | 'Buyer')
              }
              className="flex space-x-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Seller" id="title-seller" />
                <Label htmlFor="title-seller">Seller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Buyer" id="title-buyer" />
                <Label htmlFor="title-buyer">Buyer</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Survey Shortage Amendment (6.A.(8))</Label>
            <RadioGroup
              value={titlePolicyData?.shortageAmendment?.status ?? undefined}
              onValueChange={(value) =>
                updateTitlePolicyField('shortageAmendment', {
                  ...titlePolicyData.shortageAmendment,
                  status: value as any,
                })
              }
              className="flex space-x-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shall_be_amended" id="shortage-amend" />
                <Label htmlFor="shortage-amend">Shall be amended</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="will_not_be_amended"
                  id="shortage-not"
                />
                <Label htmlFor="shortage-not">Will not be amended</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Who will pay for the Shortage Amendment?</Label>
            <RadioGroup
              value={titlePolicyData?.shortageAmendment?.payer ?? undefined}
              onValueChange={(value) =>
                updateTitlePolicyField('shortageAmendment', {
                  ...titlePolicyData.shortageAmendment,
                  payer: value as any,
                })
              }
              className="flex space-x-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Seller" id="shortage-seller" />
                <Label htmlFor="shortage-seller">Seller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Buyer" id="shortage-buyer" />
                <Label htmlFor="shortage-buyer">Buyer</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Survey Section */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-medium">Survey</h3>
          <p className="text-sm text-muted-foreground">
            How will the survey be handled?
          </p>
          <RadioGroup
            value={surveyData?.status ?? undefined}
            onValueChange={(value) => updateSurveyField('status', value as any)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="existing_survey_provided"
                id="survey-existing"
              />
              <Label htmlFor="survey-existing">Use Seller's existing survey</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new_survey_ordered" id="survey-new-buyer" />
              <Label htmlFor="survey-new-buyer">New survey at Buyer's expense</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="new_survey_by_seller"
                id="survey-new-seller"
              />
              <Label htmlFor="survey-new-seller">New survey at Seller's expense</Label>
            </div>
          </RadioGroup>

          {/* Conditional fields for existing survey */}
          {surveyData?.status === 'existing_survey_provided' && (
            <div className="grid grid-cols-2 gap-4 pl-6 pt-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="survey-existing-days">
                  Days to deliver survey
                </Label>
                <Input
                  id="survey-existing-days"
                  type="number"
                  placeholder="3"
                  value={surveyData?.existing?.deliveryDays ?? ''}
                  onChange={(e) =>
                    updateSurveyField('existing', {
                      ...surveyData.existing,
                      deliveryDays: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Affidavit Payer (T-47)</Label>
                <RadioGroup
                  value={surveyData?.existing?.affidavitPayer ?? undefined}
                  onValueChange={(value) =>
                    updateSurveyField('existing', {
                      ...surveyData.existing,
                      affidavitPayer: value as any,
                    })
                  }
                  className="flex space-x-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seller" id="aff-seller" />
                    <Label htmlFor="aff-seller">Seller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="aff-buyer" />
                    <Label htmlFor="aff-buyer">Buyer</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};