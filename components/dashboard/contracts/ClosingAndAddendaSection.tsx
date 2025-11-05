'use client';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea

interface Props {
  closingData: Trec14ContractData['closing'];
  addendaData: Trec14ContractData['addenda'];
  updateClosingField: <K extends keyof Trec14ContractData['closing']>(
    field: K,
    value: Trec14ContractData['closing'][K]
  ) => void;
  updateAddendaField: <K extends keyof Trec14ContractData['addenda']>(
    field: K,
    value: Trec14ContractData['addenda'][K]
  ) => void;
}

export const ClosingAndAddendaSection: React.FC<Props> = ({
  closingData,
  addendaData,
  updateClosingField,
  updateAddendaField,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>8. Closing and Addenda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Closing Date Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="closingMonthDay">
              Closing Date (e.g., "October 31")
            </Label>
            <Input
              id="closingMonthDay"
              placeholder="October 31"
              value={closingData?.date?.monthDay ?? ''}
              onChange={(e) =>
                updateClosingField('date', {
                  ...closingData?.date,
                  monthDay: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closingYear">Closing Year (e.g., "2025")</Label>
            <Input
              id="closingYear"
              placeholder="2025"
              value={closingData?.date?.year ?? ''}
              onChange={(e) =>
                updateClosingField('date', {
                  ...closingData?.date,
                  year: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Addenda Section */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Common Addenda</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-thirdPartyFinancing">
                Third Party Financing
              </Label>
              <Switch
                id="addenda-thirdPartyFinancing"
                checked={addendaData?.thirdPartyFinancing ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('thirdPartyFinancing', val)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-sellerFinancing">Seller Financing</Label>
              <Switch
                id="addenda-sellerFinancing"
                checked={addendaData?.sellerFinancing ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('sellerFinancing', val)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-loanAssumption">Loan Assumption</Label>
              <Switch
                id="addenda-loanAssumption"
                checked={addendaData?.loanAssumption ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('loanAssumption', val)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-saleOfOtherProperty">
                Sale of Other Property
              </Label>
              <Switch
                id="addenda-saleOfOtherProperty"
                checked={addendaData?.saleOfOtherProperty ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('saleOfOtherProperty', val)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-buyersTemporaryLease">
                Buyer's Temporary Lease
              </Label>
              <Switch
                id="addenda-buyersTemporaryLease"
                checked={addendaData?.buyersTemporaryLease ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('buyersTemporaryLease', val)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-sellersTemporaryLease">
                Seller's Temporary Lease
              </Label>
              <Switch
                id="addenda-sellersTemporaryLease"
                checked={addendaData?.sellersTemporaryLease ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('sellersTemporaryLease', val)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-hoa">HOA Addendum</Label>
              <Switch
                id="addenda-hoa"
                checked={addendaData?.hoa ?? false}
                onCheckedChange={(val) => updateAddendaField('hoa', val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="addenda-lead">Lead-Based Paint Addendum</Label>
              <Switch
                id="addenda-lead"
                checked={addendaData?.leadBasedPaint ?? false}
                onCheckedChange={(val) =>
                  updateAddendaField('leadBasedPaint', val)
                }
              />
            </div>
          </div>
          <div className="space-y-2 mt-6">
            <Label htmlFor="addenda-other">Other Addenda</Label>
            <Textarea
              id="addenda-other"
              placeholder="List any other addenda separated by a comma (e.g., Seller's Disclosure Notice, Addendum for Back-Up Contract)"
              value={addendaData?.otherText?.p1 ?? ''}
              onChange={(e) =>
                updateAddendaField('otherText', {
                  ...addendaData.otherText,
                  p1: e.target.value,
                })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};