// components/dashboard/contracts/PartiesSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// Import the core data type derived from the Zod schema
import { Trec14ContractData } from "@/lib/contracts/validation";

// Define the specific structure for the Parties section
type PartiesDataType = Trec14ContractData['parties'];

interface PartiesSectionProps {
  formData: PartiesDataType;
  // The updateField function signature specialized for the Parties section
  updateField: <K extends keyof PartiesDataType>(field: K, value: PartiesDataType[K]) => void;
  // We manage the UI-specific "and/or assigns" state separately in the parent for clean separation of concerns.
  andOrAssigns: boolean;
  setAndOrAssigns: (value: boolean) => void;
}

export const PartiesSection = ({ formData, updateField, andOrAssigns, setAndOrAssigns }: PartiesSectionProps) => {

  return (
    // Uses bg-card (Light Beige #F6F3F1)
    <Card className="bg-card shadow-sm">
      <CardHeader>
        {/* Uses text-foreground (Deep Coffee Brown #4A3F3A) and font-bold (700) */}
        <CardTitle className="text-2xl font-bold text-foreground">1. Parties</CardTitle>
        <CardDescription>
            Enter the legal names of the Seller(s) and Buyer(s).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Seller Information */}
        <div className="space-y-2">
          <Label htmlFor="seller" className="text-base font-medium text-foreground">
            Seller Name(s)
          </Label>
          <Input
            id="seller"
            placeholder="e.g., John A. Smith and Mary B. Smith"
            // Inputs use bg-background (Paper White #FCFAF8) for contrast within the card
            className="bg-background"
            // Ensure null/undefined values from the initial state are handled gracefully
            value={formData.seller || ''}
            onChange={(e) => updateField('seller', e.target.value)}
          />
        </div>

        {/* Buyer Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer" className="text-base font-medium text-foreground">
                Buyer Name(s)
            </Label>
            <Input
                id="buyer"
                placeholder="e.g., Investor Acquisitions LLC"
                className="bg-background"
                value={formData.buyer || ''}
                onChange={(e) => updateField('buyer', e.target.value)}
            />
          </div>
          
          {/* "and/or assigns" Checkbox - Key requirement for wholesalers */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="andOrAssigns"
              // Uses bg-primary (Warm Tan #D9A168) when checked
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              checked={andOrAssigns}
              onCheckedChange={(checked) => setAndOrAssigns(Boolean(checked))}
            />
            <Label
              htmlFor="andOrAssigns"
              className="text-sm font-medium text-foreground leading-none cursor-pointer"
            >
              Include "and/or assigns" suffix
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};