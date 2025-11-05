// components/dashboard/contracts/EarnestMoneyOptionFeeSection.tsx
'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  earnestMoneyData: Trec14ContractData['earnestMoney'];
  optionFeeData: Trec14ContractData['optionFee'];
  updateEarnestMoneyField: <K extends keyof Trec14ContractData['earnestMoney']>(
    field: K,
    value: Trec14ContractData['earnestMoney'][K]
  ) => void;
  updateOptionFeeField: <K extends keyof Trec14ContractData['optionFee']>(
    field: K,
    value: Trec14ContractData['optionFee'][K]
  ) => void;
}

export const EarnestMoneyOptionFeeSection: React.FC<Props> = ({
  earnestMoneyData,
  optionFeeData,
  updateEarnestMoneyField,
  updateOptionFeeField,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5. Earnest Money and Option Fee</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Escrow Agent Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="escrowAgentName">Title Company (Escrow Agent)</Label>
            <Input
              id="escrowAgentName"
              placeholder="Texas National Title"
              value={earnestMoneyData?.escrowAgentName ?? ''}
              onChange={(e) =>
                updateEarnestMoneyField('escrowAgentName', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="escrowAgentAddress">Title Company Address</Label>
            <Input
              id="escrowAgentAddress"
              placeholder="123 Title Co Lane, Austin, TX"
              value={earnestMoneyData?.escrowAgentAddress?.part1 ?? ''}
              onChange={(e) =>
                updateEarnestMoneyField('escrowAgentAddress', {
                  ...earnestMoneyData?.escrowAgentAddress,
                  part1: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Earnest Money Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="earnestMoneyAmount">Initial Earnest Money</Label>
            <Input
              id="earnestMoneyAmount"
              type="number"
              placeholder="3000"
              value={earnestMoneyData?.amount ?? ''}
              onChange={(e) =>
                updateEarnestMoneyField('amount', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalAmount">Additional Earnest Money</Label>
            <Input
              id="additionalAmount"
              type="number"
              placeholder="0"
              value={earnestMoneyData?.additionalAmount ?? ''}
              onChange={(e) =>
                updateEarnestMoneyField('additionalAmount', e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalAmountDays">Days After Effective Date</Label>
            <Input
              id="additionalAmountDays"
              type="number"
              placeholder="3"
              value={earnestMoneyData?.additionalAmountDays ?? ''}
              onChange={(e) =>
                updateEarnestMoneyField('additionalAmountDays', e.target.value)
              }
            />
          </div>
        </div>

        {/* Option Fee Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
          <div className="space-y-2">
            <Label htmlFor="optionFeeAmount">Option Fee</Label>
            <Input
              id="optionFeeAmount"
              type="number"
              placeholder="250"
              value={optionFeeData?.amount ?? ''}
              onChange={(e) => updateOptionFeeField('amount', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="optionFeeDays">Option Period (Days)</Label>
            <Input
              id="optionFeeDays"
              type="number"
              placeholder="10"
              value={optionFeeData?.days ?? ''}
              onChange={(e) => updateOptionFeeField('days', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};