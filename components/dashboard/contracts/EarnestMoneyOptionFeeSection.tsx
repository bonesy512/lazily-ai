// components/dashboard/contracts/EarnestMoneyOptionFeeSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trec14ContractData } from "@/lib/contracts/validation";
import { DollarSign, CalendarDays } from "lucide-react";

type EarnestMoneyDataType = Trec14ContractData['earnestMoney'];
type OptionFeeDataType = Trec14ContractData['optionFee'];

interface EarnestMoneyOptionFeeSectionProps {
  earnestMoneyData: EarnestMoneyDataType;
  optionFeeData: OptionFeeDataType;
  updateEarnestMoneyField: <K extends keyof EarnestMoneyDataType>(field: K, value: EarnestMoneyDataType[K]) => void;
  updateOptionFeeField: <K extends keyof OptionFeeDataType>(field: K, value: OptionFeeDataType[K]) => void;
}

export const EarnestMoneyOptionFeeSection = ({ 
    earnestMoneyData, 
    optionFeeData, 
    updateEarnestMoneyField, 
    updateOptionFeeField 
}: EarnestMoneyOptionFeeSectionProps) => {

  // Handle nested object updates for the escrow agent address (simplifying to part1 for UI)
  const handleEscrowAddressChange = (value: string) => {
    // We update the nested object structure here
    updateEarnestMoneyField('escrowAgentAddress', { part1: value, part2: null });
  };

  // Helper for numeric/currency inputs
  const handleNumericChange = (handler: Function, field: string, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    handler(field, numericValue);
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">5. Earnest Money & Option Fee</CardTitle>
        <CardDescription>Details regarding the escrow agent and associated fees.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Escrow Agent Information */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="escrowAgentName">Escrow Agent Name</Label>
                <Input 
                    id="escrowAgentName" 
                    className="bg-background"
                    value={earnestMoneyData.escrowAgentName || ''} 
                    onChange={(e) => updateEarnestMoneyField('escrowAgentName', e.target.value)} 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="escrowAgentAddress">Escrow Agent Address</Label>
                <Input 
                    id="escrowAgentAddress" 
                    className="bg-background"
                    // Safely access nested property
                    value={earnestMoneyData.escrowAgentAddress?.part1 || ''} 
                    onChange={(e) => handleEscrowAddressChange(e.target.value)} 
                />
            </div>
        </div>

        {/* Earnest Money Amounts */}
        <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label htmlFor="earnestAmount">Earnest Money Amount</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="earnestAmount" 
                        className="pl-8 bg-background"
                        placeholder="0.00"
                        value={earnestMoneyData.amount || ''} 
                        onChange={(e) => handleNumericChange(updateEarnestMoneyField, 'amount', e.target.value)} 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="additionalAmount">Additional Earnest Amount</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="additionalAmount" 
                        className="pl-8 bg-background"
                        placeholder="0.00"
                        value={earnestMoneyData.additionalAmount || ''} 
                        onChange={(e) => handleNumericChange(updateEarnestMoneyField, 'additionalAmount', e.target.value)} 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="additionalAmountDays">Days for Additional Amount</Label>
                <Input 
                    id="additionalAmountDays" 
                    className="bg-background"
                    placeholder="e.g., 5"
                    value={earnestMoneyData.additionalAmountDays || ''} 
                    onChange={(e) => handleNumericChange(updateEarnestMoneyField, 'additionalAmountDays', e.target.value)} 
                />
            </div>
        </div>

        {/* Option Fee */}
        <div className="grid md:grid-cols-3 gap-6 pt-6 border-t">
            <div className="space-y-2">
                <Label htmlFor="optionFeeAmount">Option Fee Amount</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="optionFeeAmount" 
                        className="pl-8 bg-background"
                        placeholder="0.00"
                        value={optionFeeData.amount || ''} 
                        onChange={(e) => handleNumericChange(updateOptionFeeField, 'amount', e.target.value)} 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="optionFeeDays">Option Period (Days)</Label>
                <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="optionFeeDays" 
                        className="pl-10 bg-background"
                        placeholder="e.g., 7"
                        value={optionFeeData.days || ''} 
                        onChange={(e) => handleNumericChange(updateOptionFeeField, 'days', e.target.value)} 
                    />
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
};