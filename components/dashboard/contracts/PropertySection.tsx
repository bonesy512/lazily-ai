'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea

interface PropertySectionProps {
  formData: Trec14ContractData['property'];
  updateField: <K extends keyof Trec14ContractData['property']>(
    field: K,
    value: Trec14ContractData['property'][K]
  ) => void;
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  formData,
  updateField,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main St"
              value={formData?.address ?? ''}
              onChange={(e) => updateField('address', e.target.value)} // Fixed typo here
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Austin"
              value={formData?.city ?? ''}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lot">Lot</Label>
            <Input
              id="lot"
              value={formData?.lot ?? ''}
              onChange={(e) => updateField('lot', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="block">Block</Label>
            <Input
              id="block"
              value={formData?.block ?? ''}
              onChange={(e) => updateField('block', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              placeholder="Travis"
              value={formData?.county ?? ''}
              onChange={(e) => updateField('county', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="addition">Addition / Subdivision</Label>
          <Input
            id="addition"
            placeholder="Harris Park"
            value={formData?.addition ?? ''}
            onChange={(e) => updateField('addition', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exclusions">Exclusions</Label>
          <Textarea
            id="exclusions"
            placeholder="List any items to be excluded from the sale (e.g., seller's curtains in master bedroom)."
            value={formData?.exclusions?.part1 ?? ''}
            onChange={(e) =>
              updateField('exclusions', {
                ...formData.exclusions, // Keep other parts of exclusions
                part1: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Is the property part of a Homeowners Association (HOA)?</Label>
          <RadioGroup
            value={formData?.hoaStatus ?? undefined}
            onValueChange={(value) =>
              updateField('hoaStatus', value as 'is_subject' | 'not_subject')
            }
            className="flex space-x-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="is_subject" id="hoa-yes" />
              <Label htmlFor="hoa-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="not_subject" id="hoa-no" />
              <Label htmlFor="hoa-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};