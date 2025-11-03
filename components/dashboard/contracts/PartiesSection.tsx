'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface PartiesSectionProps {
  formData: Trec14ContractData['parties'];
  updateField: <K extends keyof Trec14ContractData['parties']>(field: K, value: Trec14ContractData['parties'][K]) => void;
  andOrAssigns: boolean;
  setAndOrAssigns: (value: boolean) => void;
}

export const PartiesSection: React.FC<PartiesSectionProps> = ({ formData, updateField, andOrAssigns, setAndOrAssigns }) => {
  return (
    <Card>
      <CardHeader><CardTitle>1. Parties</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="seller">Seller</Label>
          <Input id="seller" placeholder="John Doe" value={formData?.seller ?? ''} onChange={(e) => updateField('seller', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyer">Buyer</Label>
          <Input id="buyer" placeholder="Your Name or Company" value={formData?.buyer ?? ''} onChange={(e) => updateField('buyer', e.target.value)} />
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="andOrAssigns" checked={andOrAssigns} onCheckedChange={(checked) => setAndOrAssigns(Boolean(checked))} />
            <Label htmlFor="andOrAssigns" className="text-sm font-medium leading-none">Add "and/or assigns" to Buyer</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};