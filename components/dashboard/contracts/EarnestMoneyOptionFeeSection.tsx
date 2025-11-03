'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  earnestMoneyData: Trec14ContractData['earnestMoney'];
  optionFeeData: Trec14ContractData['optionFee'];
  updateEarnestMoneyField: <K extends keyof Trec14ContractData['earnestMoney']>(field: K, value: Trec14ContractData['earnestMoney'][K]) => void;
  updateOptionFeeField: <K extends keyof Trec14ContractData['optionFee']>(field: K, value: Trec14ContractData['optionFee'][K]) => void;
}

export const EarnestMoneyOptionFeeSection: React.FC<Props> = ({ earnestMoneyData, optionFeeData, updateEarnestMoneyField, updateOptionFeeField }) => {
  return (
    <Card>
      <CardHeader><CardTitle>5. Earnest Money and Option Fee</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><Label htmlFor="earnestMoneyAmount">Earnest Money</Label><Input id="earnestMoneyAmount" type="number" placeholder="3000" value={earnestMoneyData?.amount ?? ''} onChange={(e) => updateEarnestMoneyField('amount', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="escrowAgentName">Title Company (Escrow Agent)</Label><Input id="escrowAgentName" placeholder="Texas National Title" value={earnestMoneyData?.escrowAgentName ?? ''} onChange={(e) => updateEarnestMoneyField('escrowAgentName', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2"><Label htmlFor="optionFeeAmount">Option Fee</Label><Input id="optionFeeAmount" type="number" placeholder="250" value={optionFeeData?.amount ?? ''} onChange={(e) => updateOptionFeeField('amount', e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="optionFeeDays">Option Period (Days)</Label><Input id="optionFeeDays" type="number" placeholder="10" value={optionFeeData?.days ?? ''} onChange={(e) => updateOptionFeeField('days', e.target.value)} /></div>
        </div>
      </CardContent>
    </Card>
  );
};