// components/dashboard/contracts/FinancingAndLeasesSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Trec14ContractData } from "@/lib/contracts/validation";

// This component manages two distinct sections of the data model
type FinancingDataType = Trec14ContractData['financing'];
type LeasesDataType = Trec14ContractData['leases'];

interface FinancingAndLeasesSectionProps {
  financingData: FinancingDataType;
  leasesData: LeasesDataType;
  // Separate updaters for distinct top-level keys
  updateFinancingField: <K extends keyof FinancingDataType>(field: K, value: FinancingDataType[K]) => void;
  updateLeasesField: <K extends keyof LeasesDataType>(field: K, value: LeasesDataType[K]) => void;
}

export const FinancingAndLeasesSection = ({ 
    financingData, 
    leasesData, 
    updateFinancingField, 
    updateLeasesField 
}: FinancingAndLeasesSectionProps) => {

  // Determine the active financing option for the RadioGroup visualization
  const activeFinancing = () => {
    if (financingData.thirdParty) return 'thirdParty';
    if (financingData.loanAssumption) return 'loanAssumption';
    if (financingData.seller) return 'seller';
    return undefined;
  };

  // Handle RadioGroup change to ensure mutual exclusivity
  const handleFinancingChange = (value: string) => {
    // Set the selected option and reset others simultaneously
    updateFinancingField('thirdParty', value === 'thirdParty');
    updateFinancingField('loanAssumption', value === 'loanAssumption');
    updateFinancingField('seller', value === 'seller');
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">4. Financing & Leases</CardTitle>
        <CardDescription>Select the financing method and any applicable leases.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-10">
        
        {/* Financing Section (Using RadioGroup for mutually exclusive choices) */}
        <div>
            <h3 className="text-lg font-semibold mb-4">Financing Approval Method</h3>
            <RadioGroup 
                value={activeFinancing()} 
                onValueChange={handleFinancingChange}
                className="space-y-3"
            >
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="thirdParty" id="financing-thirdParty" />
                    <Label htmlFor="financing-thirdParty" className="cursor-pointer">Third Party Financing</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="loanAssumption" id="financing-loanAssumption" />
                    <Label htmlFor="financing-loanAssumption" className="cursor-pointer">Loan Assumption</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="seller" id="financing-seller" />
                    <Label htmlFor="financing-seller" className="cursor-pointer">Seller Financing</Label>
                </div>
            </RadioGroup>
        </div>

        {/* Leases Section (Using Switches for independent toggles) */}
        <div>
            <h3 className="text-lg font-semibold mb-4">Active Leases</h3>
            <p className="text-sm text-muted-foreground mb-4">Toggle if any of the following leases are active:</p>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <Label htmlFor="lease-residential" className="text-sm font-medium">Residential Lease</Label>
                    <Switch
                        id="lease-residential"
                        checked={leasesData.isResidential || false}
                        onCheckedChange={(checked) => updateLeasesField('isResidential', checked)}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <Label htmlFor="lease-fixture" className="text-sm font-medium">Fixture Lease</Label>
                    <Switch
                        id="lease-fixture"
                        checked={leasesData.isFixture || false}
                        onCheckedChange={(checked) => updateLeasesField('isFixture', checked)}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                    <Label htmlFor="lease-naturalResource" className="text-sm font-medium">Natural Resource Lease</Label>
                    <Switch
                        id="lease-naturalResource"
                        checked={leasesData.isNaturalResource || false}
                        onCheckedChange={(checked) => updateLeasesField('isNaturalResource', checked)}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>
            </div>
        </div>
        
      </CardContent>
    </Card>
  );
};