// components/dashboard/contracts/PriceSection.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trec14ContractData } from "@/lib/contracts/validation";
import { DollarSign } from "lucide-react";

type PriceDataType = Trec14ContractData['price'];

interface PriceSectionProps {
  formData: PriceDataType;
  updateField: <K extends keyof PriceDataType>(field: K, value: PriceDataType[K]) => void;
}

export const PriceSection = ({ formData, updateField }: PriceSectionProps) => {
  
    // Helper function to handle currency inputs (basic validation/formatting)
    const handleCurrencyChange = (field: keyof PriceDataType, value: string) => {
        // Remove non-numeric characters except for the decimal point
        const numericValue = value.replace(/[^0-9.]/g, '');
        updateField(field, numericValue);
    };

    return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">3. Sales Price</CardTitle>
        <CardDescription>Enter the breakdown of the sales price.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cash Portion */}
        <div className="space-y-2">
          <Label htmlFor="cashPortion">A. Cash Portion</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                id="cashPortion" 
                type="text"
                placeholder="0.00"
                className="pl-8 bg-background"
                value={formData.cashPortion || ''} 
                onChange={(e) => handleCurrencyChange('cashPortion', e.target.value)} 
            />
          </div>
        </div>

        {/* Finance Amount */}
        <div className="space-y-2">
          <Label htmlFor="financeAmount">B. Sum of Financing</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                id="financeAmount" 
                type="text"
                placeholder="0.00"
                className="pl-8 bg-background"
                value={formData.financeAmount || ''} 
                onChange={(e) => handleCurrencyChange('financeAmount', e.target.value)} 
            />
          </div>
        </div>

        {/* Total Sales Price */}
        <div className="space-y-2">
          <Label htmlFor="salesPrice" className="font-bold">C. Total Sales Price (A + B)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                id="salesPrice" 
                type="text"
                placeholder="0.00"
                className="pl-8 font-bold bg-background"
                // TREC allows direct input, though auto-calculation is a potential future enhancement.
                value={formData.salesPrice || ''} 
                onChange={(e) => handleCurrencyChange('salesPrice', e.target.value)} 
            />
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
};