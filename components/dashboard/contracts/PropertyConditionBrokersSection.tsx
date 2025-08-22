// components/dashboard/contracts/PropertyConditionBrokersSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea"; // Ensure Textarea is imported
import { Trec14ContractData } from "@/lib/contracts/validation";

type PropertyConditionDataType = Trec14ContractData['propertyCondition'];
type BrokersDataType = Trec14ContractData['brokers'];

interface PropertyConditionBrokersSectionProps {
  propertyConditionData: PropertyConditionDataType;
  brokersData: BrokersDataType;
  updatePropertyConditionField: <K extends keyof PropertyConditionDataType>(field: K, value: PropertyConditionDataType[K]) => void;
  updateBrokersField: <K extends keyof BrokersDataType>(field: K, value: BrokersDataType[K]) => void;
}

export const PropertyConditionBrokersSection = ({ 
    propertyConditionData, 
    brokersData, 
    updatePropertyConditionField, 
    updateBrokersField 
}: PropertyConditionBrokersSectionProps) => {

    // Helper for nested Seller Disclosure updates
    const updateSellerDisclosure = <K extends keyof PropertyConditionDataType['sellerDisclosure']>(
        field: K, 
        value: PropertyConditionDataType['sellerDisclosure'][K]
    ) => {
        const updatedDisclosure = {
            ...(propertyConditionData.sellerDisclosure || {}),
            [field]: value
        };
        updatePropertyConditionField('sellerDisclosure', updatedDisclosure);
    };

    // Helper for nested Broker updates (Example: Listing Firm Name)
    const updateBrokerFirmName = (type: 'listing' | 'other', firmName: string) => {
        const updatedBroker = {
            ...(brokersData[type] || {}),
            firmName: firmName
        };
        updateBrokersField(type, updatedBroker);
    };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">7. Property Condition & Brokers</CardTitle>
        <CardDescription>Disclosures, acceptance status, and broker information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
        
        {/* Seller's Disclosure */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Seller's Disclosure Notice Status</h3>
            <RadioGroup 
                value={propertyConditionData.sellerDisclosure?.status || undefined} 
                onValueChange={(value) => updateSellerDisclosure('status', value as any)}
                className="space-y-3"
            >
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="received" id="disclosure-received" />
                    <Label htmlFor="disclosure-received" className="cursor-pointer">Buyer has received the Notice.</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="not_received" id="disclosure-not-received" />
                    <Label htmlFor="disclosure-not-received" className="cursor-pointer">Buyer has not received the Notice.</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="not_required" id="disclosure-not-required" />
                    <Label htmlFor="disclosure-not-required" className="cursor-pointer">Seller is not required to furnish the Notice.</Label>
                </div>
            </RadioGroup>
        </div>

        {/* Acceptance of Property Condition */}
        <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Acceptance of Property Condition</h3>
            <RadioGroup 
                value={propertyConditionData.acceptanceStatus || undefined} 
                onValueChange={(value) => updatePropertyConditionField('acceptanceStatus', value as any)}
                className="space-y-3"
            >
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="as_is" id="condition-as-is" />
                    <Label htmlFor="condition-as-is" className="cursor-pointer">"As Is"</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="as_is_with_repairs" id="condition-repairs" />
                    <Label htmlFor="condition-repairs" className="cursor-pointer">"As Is" with specific repairs (list below)</Label>
                </div>
            </RadioGroup>

            {/* Conditionally show repairs list */}
            {propertyConditionData.acceptanceStatus === 'as_is_with_repairs' && (
                <div className="pt-3 pl-6">
                    <Label htmlFor="repairsList">Specific Repairs Requested:</Label>
                    {/* Schema defines repairsList as an object (part1, part2). We simplify to a single textarea for UI. */}
                    <Textarea 
                        id="repairsList"
                        rows={4}
                        className="bg-background mt-1"
                        value={propertyConditionData.repairsList?.part1 || ''}
                        onChange={(e) => updatePropertyConditionField('repairsList', { part1: e.target.value, part2: null })}
                    />
                </div>
            )}
        </div>

        {/* Brokers Information */}
        <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-semibold">Broker Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="listingBroker">Listing Broker Firm Name</Label>
                    <Input 
                        id="listingBroker" 
                        className="bg-background"
                        value={brokersData.listing?.firmName || ''}
                        onChange={(e) => updateBrokerFirmName('listing', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="otherBroker">Other Broker Firm Name</Label>
                    <Input 
                        id="otherBroker" 
                        className="bg-background"
                        value={brokersData.other?.firmName || ''}
                        onChange={(e) => updateBrokerFirmName('other', e.target.value)}
                    />
                </div>
            </div>
            {/* A production implementation should include License No, Associate Name, etc. */}
        </div>

      </CardContent>
    </Card>
  );
};