// components/dashboard/contracts/PropertySection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Import the core data type derived from the Zod schema
import { Trec14ContractData } from "@/lib/contracts/validation";

// Define the specific structure for the Property section
type PropertyDataType = Trec14ContractData['property'];

interface PropertySectionProps {
  formData: PropertyDataType;
  updateField: <K extends keyof PropertyDataType>(field: K, value: PropertyDataType[K]) => void;
}

export const PropertySection = ({ formData, updateField }: PropertySectionProps) => {
  return (
    // Uses bg-card (Light Beige #F6F3F1)
    <Card className="bg-card shadow-sm">
      <CardHeader>
        {/* Uses text-foreground (Deep Coffee Brown #4A3F3A) and font-bold (700) */}
        <CardTitle className="text-2xl font-bold text-foreground">2. Property</CardTitle>
        <CardDescription>
            Provide the legal description and address of the property.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Legal Description */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lot">Lot</Label>
            <Input id="lot" value={formData.lot || ''} onChange={(e) => updateField('lot', e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block">Block</Label>
            <Input id="block" value={formData.block || ''} onChange={(e) => updateField('block', e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addition">Addition/Subdivision</Label>
            <Input id="addition" placeholder="e.g., Shady Acres Sec 03" value={formData.addition || ''} onChange={(e) => updateField('addition', e.target.value)} className="bg-background" />
          </div>
        </div>

        {/* Location and Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city || ''} onChange={(e) => updateField('city', e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input id="county" value={formData.county || ''} onChange={(e) => updateField('county', e.target.value)} className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address and Zip Code</Label>
              <Input 
                id="address" 
                placeholder="e.g., 123 Main St, 78701"
                value={formData.address || ''} 
                onChange={(e) => updateField('address', e.target.value)} 
                className="bg-background"
              />
            </div>
        </div>

        {/* HOA Status (Using RadioGroup for clear binary choice) */}
        <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-medium">Is the property subject to a mandatory HOA?</Label>
            <RadioGroup 
                value={formData.hoaStatus || undefined} 
                onValueChange={(value) => updateField('hoaStatus', value as PropertyDataType['hoaStatus'])}
                className="flex space-x-6"
            >
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="is_subject" id="hoa-yes" />
                    <Label htmlFor="hoa-yes" className="cursor-pointer">Yes (Is Subject)</Label>
                </div>
                <div className="flex items-center space-x-3">
                    <RadioGroupItem value="not_subject" id="hoa-no" />
                    <Label htmlFor="hoa-no" className="cursor-pointer">No (Not Subject)</Label>
                </div>
            </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};