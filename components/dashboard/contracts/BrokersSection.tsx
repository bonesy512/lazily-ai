// components/dashboard/contracts/BrokersSection.tsx
'use client';

import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Props {
  brokersData: Trec14ContractData['brokers'];
  updateBrokersField: (
    section: 'listing' | 'other' | 'selling',
    subSection: string, // Can be 'associate', 'supervisor', or an empty string for direct fields
    field: string,
    value: any
  ) => void;
}

export const BrokersSection: React.FC<Props> = ({ brokersData, updateBrokersField }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Broker Information</CardTitle>
        <CardDescription>
          Enter details for both the Listing and Other (e.g., Buyer's) Broker.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        
        {/* LEFT COLUMN: Other Broker */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg border-b pb-2">Other Broker Firm</h3>
          <div className="space-y-2">
            <Label>Firm Name</Label>
            <Input 
              value={brokersData?.other?.firmName ?? ''} 
              onChange={e => updateBrokersField('other', '', 'firmName', e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>Represents</Label>
             <RadioGroup 
                value={brokersData?.other?.represents ?? undefined} 
                onValueChange={(val) => updateBrokersField('other', '', 'represents', val)} 
                className="flex flex-col space-y-2 pt-2"
            >
                <div className="flex items-center space-x-2"><RadioGroupItem value="buyer_agent" id="rep-buyer" /><Label htmlFor="rep-buyer">Buyer only as Buyer's agent</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="seller_subagent" id="rep-subagent" /><Label htmlFor="rep-subagent">Seller as Listing Broker's subagent</Label></div>
            </RadioGroup>
          </div>
           <div className="space-y-2">
            <Label>Associate's Name</Label>
            <Input value={brokersData?.other?.associate?.name ?? ''} onChange={e => updateBrokersField('other', 'associate', 'name', e.target.value)} />
          </div>
        </div>

        {/* RIGHT COLUMN: Listing Broker */}
        <div className="space-y-6">
           <h3 className="font-semibold text-lg border-b pb-2">Listing Broker Firm</h3>
           <div className="space-y-2">
            <Label>Firm Name</Label>
            <Input value={brokersData?.listing?.firmName ?? ''} onChange={e => updateBrokersField('listing', '', 'firmName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Represents</Label>
             <RadioGroup 
                value={brokersData?.listing?.represents ?? undefined} 
                onValueChange={(val) => updateBrokersField('listing', '', 'represents', val)} 
                className="flex flex-col space-y-2 pt-2"
            >
                <div className="flex items-center space-x-2"><RadioGroupItem value="intermediary" id="rep-inter" /><Label htmlFor="rep-inter">Seller and Buyer as an intermediary</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="seller_agent" id="rep-seller" /><Label htmlFor="rep-seller">Seller only as Seller's agent</Label></div>
            </RadioGroup>
          </div>
           <div className="space-y-2">
            <Label>Listing Associate's Name</Label>
            <Input value={brokersData?.listing?.associate?.name ?? ''} onChange={e => updateBrokersField('listing', 'associate', 'name', e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label>Listing Associate's License No.</Label>
            <Input value={brokersData?.listing?.associate?.licenseNo ?? ''} onChange={e => updateBrokersField('listing', 'associate', 'licenseNo', e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};