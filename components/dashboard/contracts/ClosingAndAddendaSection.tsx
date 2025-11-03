'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface Props {
  closingData: Trec14ContractData['closing'];
  addendaData: Trec14ContractData['addenda'];
  updateClosingField: <K extends keyof Trec14ContractData['closing']>(field: K, value: Trec14ContractData['closing'][K]) => void;
  updateAddendaField: <K extends keyof Trec14ContractData['addenda']>(field: K, value: Trec14ContractData['addenda'][K]) => void;
}

export const ClosingAndAddendaSection: React.FC<Props> = ({ closingData, addendaData, updateClosingField, updateAddendaField }) => {
  return (
    <Card>
      <CardHeader><CardTitle>8. Closing and Addenda</CardTitle></CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><Label htmlFor="closingMonthDay">Closing Date (e.g., "October 31")</Label><Input id="closingMonthDay" placeholder="October 31" value={closingData?.date?.monthDay ?? ''} onChange={(e) => updateClosingField('date', { ...closingData?.date, monthDay: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="closingYear">Closing Year (e.g., "2025")</Label><Input id="closingYear" placeholder="2025" value={closingData?.date?.year ?? ''} onChange={(e) => updateClosingField('date', { ...closingData?.date, year: e.target.value })} /></div>
        </div>
        <div>
          <h4 className="font-medium mb-4">Common Addenda</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between"><Label htmlFor="addenda-hoa">HOA Addendum</Label><Switch id="addenda-hoa" checked={addendaData?.hoa} onCheckedChange={(val) => updateAddendaField('hoa', val)} /></div>
            <div className="flex items-center justify-between"><Label htmlFor="addenda-lead">Lead-Based Paint Addendum</Label><Switch id="addenda-lead" checked={addendaData?.leadBasedPaint} onCheckedChange={(val) => updateAddendaField('leadBasedPaint', val)} /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};