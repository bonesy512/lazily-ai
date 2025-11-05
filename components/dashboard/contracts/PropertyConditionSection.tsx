// components/dashboard/contracts/PropertyConditionSection.tsx
'use client';

import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input'; // Import Input

interface Props {
  propertyConditionData: Trec14ContractData['propertyCondition'];
  specialProvisionsData: Trec14ContractData['specialProvisions'];
  updatePropertyConditionField: <
    K extends keyof Trec14ContractData['propertyCondition']
  >(
    field: K,
    value: Trec14ContractData['propertyCondition'][K]
  ) => void;
  updateSpecialProvisionsField: <
    K extends keyof Trec14ContractData['specialProvisions']
  >(
    field: K,
    value: Trec14ContractData['specialProvisions'][K]
  ) => void;
}

export const PropertyConditionSection: React.FC<Props> = ({
  propertyConditionData,
  specialProvisionsData,
  updatePropertyConditionField,
  updateSpecialProvisionsField,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>7. Property Condition & Special Provisions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Seller's Disclosure Section */}
        <div>
          <Label className="font-medium">Seller's Disclosure (Paragraph 7B)</Label>
          <RadioGroup
            value={propertyConditionData?.sellerDisclosure?.status ?? undefined}
            onValueChange={(value) =>
              updatePropertyConditionField('sellerDisclosure', {
                ...propertyConditionData.sellerDisclosure,
                status: value as any,
              })
            }
            className="flex flex-col space-y-2 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="received" id="sd-received" />
              <Label htmlFor="sd-received">Buyer has received the Notice.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_received" id="sd-not-received" />
              <Label htmlFor="sd-not-received">
                Buyer has not received the Notice.
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_required" id="sd-not-required" />
              <Label htmlFor="sd-not-required">
                Seller is not required to furnish the notice.
              </Label>
            </div>
          </RadioGroup>

          {/* Conditional field for delivery days */}
          {propertyConditionData?.sellerDisclosure?.status ===
            'not_received' && (
            <div className="space-y-2 pl-6 pt-4 border-l-2 border-primary/20">
              <Label htmlFor="sd-delivery-days">
                Seller will deliver the Notice to Buyer within (days):
              </Label>
              <Input
                id="sd-delivery-days"
                type="number"
                placeholder="3"
                className="max-w-xs"
                value={
                  propertyConditionData?.sellerDisclosure?.deliveryDays ?? ''
                }
                onChange={(e) =>
                  updatePropertyConditionField('sellerDisclosure', {
                    ...propertyConditionData.sellerDisclosure,
                    deliveryDays: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Property Acceptance Section */}
        <div className="border-t pt-6">
          <Label className="font-medium">
            Property Acceptance (Paragraph 7D)
          </Label>
          <p className="text-sm text-muted-foreground mb-4">
            How is the buyer accepting the property's condition?
          </p>
          <RadioGroup
            value={propertyConditionData?.acceptanceStatus ?? 'as_is'}
            onValueChange={(value) =>
              updatePropertyConditionField('acceptanceStatus', value as any)
            }
            className="flex flex-col space-y-2 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="as_is" id="cond-as-is" />
              <Label htmlFor="cond-as-is">Buyer accepts the Property As Is.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="as_is_with_repairs"
                id="cond-repairs"
              />
              <Label htmlFor="cond-repairs">
                Buyer accepts the Property As Is provided Seller completes
                specific repairs.
              </Label>
            </div>
          </RadioGroup>

          {/* Conditional field for repairs list */}
          {propertyConditionData?.acceptanceStatus ===
            'as_is_with_repairs' && (
            <div className="space-y-2 pl-6 pt-4 border-l-2 border-primary/20">
              <Label htmlFor="repairs-list">Repairs List</Label>
              <Textarea
                id="repairs-list"
                placeholder="List specific repairs and treatments Seller will complete at Seller's expense."
                value={propertyConditionData?.repairsList?.part1 ?? ''}
                onChange={(e) =>
                  updatePropertyConditionField('repairsList', {
                    ...propertyConditionData.repairsList,
                    part1: e.target.value,
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Special Provisions Section */}
        <div className="space-y-2 border-t pt-6">
          <Label htmlFor="specialProvisions">
            Special Provisions (Paragraph 11)
          </Label>
          <Textarea
            id="specialProvisions"
            placeholder="Insert only factual statements and business details. TREC rules prohibit licensees from adding statements for which a contract addendum has been promulgated."
            value={specialProvisionsData?.text ?? ''}
            onChange={(e) =>
              updateSpecialProvisionsField('text', e.target.value)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};