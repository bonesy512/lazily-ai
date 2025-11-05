// components/dashboard/contracts/BrokersSection.tsx
'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

export const BrokersSection: React.FC<Props> = ({
  brokersData,
  updateBrokersField,
}) => {
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
          <h3 className="font-semibold text-lg border-b pb-2">
            Other Broker Firm
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="other-firm-name">Firm Name</Label>
              <Input
                id="other-firm-name"
                value={brokersData?.other?.firmName ?? ''}
                onChange={(e) =>
                  updateBrokersField('other', '', 'firmName', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other-firm-license">Firm License No.</Label>
              <Input
                id="other-firm-license"
                value={brokersData?.other?.firmLicenseNo ?? ''}
                onChange={(e) =>
                  updateBrokersField(
                    'other',
                    '',
                    'firmLicenseNo',
                    e.target.value
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Represents</Label>
            <RadioGroup
              value={brokersData?.other?.represents ?? undefined}
              onValueChange={(val) =>
                updateBrokersField('other', '', 'represents', val)
              }
              className="flex flex-col space-y-2 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buyer_agent" id="rep-buyer" />
                <Label htmlFor="rep-buyer">Buyer only as Buyer's agent</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seller_subagent" id="rep-subagent" />
                <Label htmlFor="rep-subagent">
                  Seller as Listing Broker's subagent
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-4 pt-2">
            <Label className="font-medium">Other Associate's Information</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="other-assoc-name">Name</Label>
                <Input
                  id="other-assoc-name"
                  value={brokersData?.other?.associate?.name ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'other',
                      'associate',
                      'name',
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other-assoc-license">License No.</Label>
                <Input
                  id="other-assoc-license"
                  value={brokersData?.other?.associate?.licenseNo ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'other',
                      'associate',
                      'licenseNo',
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other-assoc-email">Email</Label>
                <Input
                  id="other-assoc-email"
                  type="email"
                  value={brokersData?.other?.associate?.email ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'other',
                      'associate',
                      'email',
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other-assoc-phone">Phone</Label>
                <Input
                  id="other-assoc-phone"
                  type="tel"
                  value={brokersData?.other?.associate?.phone ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'other',
                      'associate',
                      'phone',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Listing Broker */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg border-b pb-2">
            Listing Broker Firm
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listing-firm-name">Firm Name</Label>
              <Input
                id="listing-firm-name"
                value={brokersData?.listing?.firmName ?? ''}
                onChange={(e) =>
                  updateBrokersField('listing', '', 'firmName', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listing-firm-license">Firm License No.</Label>
              <Input
                id="listing-firm-license"
                value={brokersData?.listing?.firmLicenseNo ?? ''}
                onChange={(e) =>
                  updateBrokersField(
                    'listing',
                    '',
                    'firmLicenseNo',
                    e.target.value
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Represents</Label>
            <RadioGroup
              value={brokersData?.listing?.represents ?? undefined}
              onValueChange={(val) =>
                updateBrokersField('listing', '', 'represents', val)
              }
              className="flex flex-col space-y-2 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediary" id="rep-inter" />
                <Label htmlFor="rep-inter">
                  Seller and Buyer as an intermediary
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seller_agent" id="rep-seller" />
                <Label htmlFor="rep-seller">
                  Seller only as Seller's agent
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-4 pt-2">
            <Label className="font-medium">Listing Associate's Information</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="listing-assoc-name">Name</Label>
                <Input
                  id="listing-assoc-name"
                  value={brokersData?.listing?.associate?.name ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'listing',
                      'associate',
                      'name',
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing-assoc-license">License No.</Label>
                <Input
                  id="listing-assoc-license"
                  value={brokersData?.listing?.associate?.licenseNo ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'listing',
                      'associate',
                      'licenseNo',
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing-assoc-email">Email</Label>
                <Input
                  id="listing-assoc-email"
                  type="email"
                  value={brokersData?.listing?.associate?.email ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'listing',
                      'associate',
                      'email',
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="listing-assoc-phone">Phone</Label>
                <Input
                  id="listing-assoc-phone"
                  type="tel"
                  value={brokersData?.listing?.associate?.phone ?? ''}
                  onChange={(e) =>
                    updateBrokersField(
                      'listing',
                      'associate',
                      'phone',
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};