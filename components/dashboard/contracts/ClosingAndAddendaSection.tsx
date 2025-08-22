// components/dashboard/contracts/ClosingAndAddendaSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trec14ContractData } from "@/lib/contracts/validation";

type ClosingDataType = Trec14ContractData['closing'];
type AddendaDataType = Trec14ContractData['addenda'];

interface ClosingAndAddendaSectionProps {
  closingData: ClosingDataType;
  addendaData: AddendaDataType;
  updateClosingField: <K extends keyof ClosingDataType>(field: K, value: ClosingDataType[K]) => void;
  updateAddendaField: <K extends keyof AddendaDataType>(field: K, value: AddendaDataType[K]) => void;
}

export const ClosingAndAddendaSection = ({ 
    closingData,
    addendaData,
    updateClosingField,
    updateAddendaField
}: ClosingAndAddendaSectionProps) => {

    // Handlers for nested Closing Date updates
    const updateClosingDate = (part: 'monthDay' | 'year', value: string) => {
        updateClosingField('date', {
            ...(closingData.date || {}),
            [part]: value
        });
    };

    // Define the list of addenda checkboxes required (Requirement 2)
    const addendaOptions: { id: keyof AddendaDataType, label: string }[] = [
        { id: 'thirdPartyFinancing', label: 'Third Party Financing Addendum' },
        { id: 'sellerFinancing', label: 'Seller Financing Addendum' },
        { id: 'loanAssumption', label: 'Loan Assumption Addendum' },
        { id: 'hoa', label: 'Addendum for Property Subject to Mandatory HOA' },
        { id: 'saleOfOtherProperty', label: 'Addendum for Sale of Other Property by Buyer' },
        { id: 'leadBasedPaint', label: 'Lead-Based Paint Addendum' },
        { id: 'buyersTemporaryLease', label: "Buyer's Temporary Residential Lease" },
        { id: 'sellersTemporaryLease', label: "Seller's Temporary Residential Lease" },
    ];

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">8. Closing & Addenda</CardTitle>
        <CardDescription>Set the closing date and select all applicable addenda.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Closing Date */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Closing Date</h3>
            <div className="flex gap-6">
                <div className="space-y-2">
                    <Label htmlFor="closingMonthDay">Month/Day (MM/DD)</Label>
                    <Input 
                        id="closingMonthDay" 
                        placeholder="e.g., 09/15"
                        className="w-40 bg-background"
                        value={closingData.date?.monthDay || ''}
                        onChange={(e) => updateClosingDate('monthDay', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="closingYear">Year (YYYY)</Label>
                    <Input 
                        id="closingYear" 
                        placeholder="e.g., 2025"
                        className="w-40 bg-background"
                        value={closingData.date?.year || ''}
                        onChange={(e) => updateClosingDate('year', e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Addenda Checklist */}
        <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">Agreement of Parties (Addenda)</h3>
            <p className="text-sm text-muted-foreground">Check all addenda that apply and are attached to this contract:</p>
            
            <div className="grid md:grid-cols-2 gap-4">
                {addendaOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-3">
                        <Checkbox
                            id={`addenda-${String(option.id)}`}
                            checked={Boolean(addendaData[option.id])}
                            // Ensure the value passed to updateAddendaField is a boolean
                            onCheckedChange={(checked) => updateAddendaField(option.id, Boolean(checked) as any)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label htmlFor={`addenda-${String(option.id)}`} className="text-sm font-medium cursor-pointer">
                            {option.label}
                        </Label>
                    </div>
                ))}
            </div>
        </div>

      </CardContent>
    </Card>
  );
};