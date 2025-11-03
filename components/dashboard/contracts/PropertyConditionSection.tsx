// components/dashboard/contracts/PropertyConditionSection.tsx
'use client';

import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  propertyConditionData: Trec14ContractData['propertyCondition'];
  specialProvisionsData: Trec14ContractData['specialProvisions'];
  updatePropertyConditionField: <K extends keyof Trec14ContractData['propertyCondition']>(field: K, value: Trec14ContractData['propertyCondition'][K]) => void;
  updateSpecialProvisionsField: <K extends keyof Trec14ContractData['specialProvisions']>(field: K, value: Trec14ContractData['specialProvisions'][K]) => void;
}

export const PropertyConditionSection: React.FC<Props> = ({
  propertyConditionData,
  specialProvisionsData,
  updatePropertyConditionField,
  updateSpecialProvisionsField
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>7. Property Condition & Special Provisions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label className="font-medium">Property Acceptance (Paragraph 7D)</Label>
          <p className="text-sm text-muted-foreground mb-4">How is the buyer accepting the property's condition?</p>
          <RadioGroup
            value={propertyConditionData?.acceptanceStatus ?? 'as_is'}
            onValueChange={(value) => updatePropertyConditionField('acceptanceStatus', value as any)}
            className="flex flex-col space-y-2 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="as_is" id="cond-as-is" />
              <Label htmlFor="cond-as-is">Buyer accepts the Property As Is.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="as_is_with_repairs" id="cond-repairs" />
              <Label htmlFor="cond-repairs">Buyer accepts the Property As Is provided Seller completes specific repairs.</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialProvisions">Special Provisions (Paragraph 11)</Label>
          <Textarea
            id="specialProvisions"
            placeholder="Insert only factual statements and business details. TREC rules prohibit licensees from adding statements for which a contract addendum has been promulgated."
            value={specialProvisionsData?.text ?? ''}
            onChange={(e) => updateSpecialProvisionsField('text', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};