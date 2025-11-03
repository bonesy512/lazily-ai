// components/dashboard/contracts/NoticesAttorneysExecutionSection.tsx
'use client';

import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props {
  noticesData: Trec14ContractData['notices'];
  attorneysData: Trec14ContractData['attorneys'];
  executionData: Trec14ContractData['execution'];
  updateNoticesField: (section: 'buyer' | 'seller', field: 'contactInfo', value: any) => void;
  updateAttorneysField: (section: 'buyer' | 'seller', field: 'name' | 'email' | 'phone', value: string) => void;
  updateExecutionField: <K extends keyof Trec14ContractData['execution']>(field: K, value: Trec14ContractData['execution'][K]) => void;
}

export const NoticesAttorneysExecutionSection: React.FC<Props> = ({
    noticesData,
    attorneysData,
    executionData,
    updateNoticesField,
    updateAttorneysField,
    updateExecutionField,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>9. Notices, Attorneys, & Execution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <h4 className="font-medium mb-4">Notices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="buyer-notice-email">Buyer's Notice Email</Label>
                    <Input id="buyer-notice-email" placeholder="buyer@example.com" value={noticesData?.buyer?.contactInfo?.part1 ?? ''} onChange={e => updateNoticesField('buyer', 'contactInfo', { part1: e.target.value })}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="seller-notice-email">Seller's Notice Email</Label>
                    <Input id="seller-notice-email" placeholder="seller@example.com" value={noticesData?.seller?.contactInfo?.part1 ?? ''} onChange={e => updateNoticesField('seller', 'contactInfo', { part1: e.target.value })}/>
                </div>
            </div>
        </div>

         <div>
            <h4 className="font-medium mb-4 border-t pt-6">Attorney Information (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="buyer-attorney">Buyer's Attorney</Label>
                    <Input id="buyer-attorney" value={attorneysData?.buyer?.name ?? ''} onChange={e => updateAttorneysField('buyer', 'name', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="seller-attorney">Seller's Attorney</Label>
                    <Input id="seller-attorney" value={attorneysData?.seller?.name ?? ''} onChange={e => updateAttorneysField('seller', 'name', e.target.value)} />
                </div>
            </div>
        </div>

        <div>
            <h4 className="font-medium mb-4 border-t pt-6">Executed Date</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="exec-month">Month</Label>
                    <Input id="exec-month" placeholder="October" value={executionData?.month ?? ''} onChange={e => updateExecutionField('month', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="exec-day">Day</Label>
                    <Input id="exec-day" placeholder="17" value={executionData?.day ?? ''} onChange={e => updateExecutionField('day', e.target.value)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="exec-year">Year</Label>
                    <Input id="exec-year" placeholder="2025" value={executionData?.year ?? ''} onChange={e => updateExecutionField('year', e.target.value)} />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};