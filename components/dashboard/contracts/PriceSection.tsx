'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PriceSectionProps {
  formData: Trec14ContractData['price'];
  updateField: <K extends keyof Trec14ContractData['price']>(field: K, value: Trec14ContractData['price'][K]) => void;
}

export const PriceSection: React.FC<PriceSectionProps> = ({ formData, updateField }) => {
  return (
    <Card>
      <CardHeader><CardTitle>3. Sales Price</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2"><Label htmlFor="cashPortion">A. Cash Portion</Label><Input id="cashPortion" type="number" placeholder="50000" value={formData?.cashPortion ?? ''} onChange={(e) => updateField('cashPortion', e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="financeAmount">B. Sum of Financing</Label><Input id="financeAmount" type="number" placeholder="250000" value={formData?.financeAmount ?? ''} onChange={(e) => updateField('financeAmount', e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="salesPrice">C. Sales Price (A + B)</Label><Input id="salesPrice" type="number" placeholder="300000" value={formData?.salesPrice ?? ''} onChange={(e) => updateField('salesPrice', e.target.value)} /></div>
      </CardContent>
    </Card>
  );
};