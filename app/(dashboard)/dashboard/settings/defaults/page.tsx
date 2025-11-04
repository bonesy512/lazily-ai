// app/(dashboard)/dashboard/settings/defaults/page.tsx

'use client';

import { useActionState } from 'react';
import useSWR from 'swr';
import { updateTeamDefaults } from '@/app/(dashboard)/dashboard/settings/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TeamContractDefaults } from '@/lib/db/schema';
import { ActionState } from '@/lib/auth/action-helpers';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DefaultsFormSkeleton() {
  return ( <div className="space-y-6">{[...Array(8)].map((_, i) => ( <div key={i} className="space-y-2"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div><div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div></div> ))}</div> );
}

export default function ContractDefaultsPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateTeamDefaults, {});
  const { data: defaults, isLoading } = useSWR<TeamContractDefaults>('/api/team/defaults', fetcher);

  return (
    <section>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Contract Defaults</h1>
      <form action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle>Standard Information</CardTitle>
            <CardDescription>Enter your standard information here to pre-populate every new contract you create.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <DefaultsFormSkeleton /> : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-md font-semibold mb-4 border-b pb-2">Your Brokerage (Listing Broker)</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="listingFirmName">Brokerage Firm Name</Label><Input id="listingFirmName" name="listingFirmName" placeholder="e.g., Schustereit and Co." defaultValue={defaults?.listingFirmName ?? ''} /></div><div className="space-y-2"><Label htmlFor="listingFirmLicenseNo">Brokerage License No.</Label><Input id="listingFirmLicenseNo" name="listingFirmLicenseNo" placeholder="e.g., 21066809" defaultValue={defaults?.listingFirmLicenseNo ?? ''} /></div></div>
                    <div className="space-y-2"><Label htmlFor="listingBrokerAddress">Brokerage Office Address</Label><Input id="listingBrokerAddress" name="listingBrokerAddress" placeholder="123 Main St, Austin, TX 78701" defaultValue={defaults?.listingBrokerAddress ?? ''} /></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-semibold mb-4 border-b pb-2">Your Information (Listing Associate)</h3>
                   <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="listingAssociateName">Your Name / Team Name</Label><Input id="listingAssociateName" name="listingAssociateName" placeholder="e.g., Thomas Schustereit" defaultValue={defaults?.listingAssociateName ?? ''} /></div><div className="space-y-2"><Label htmlFor="listingAssociateLicenseNo">Your License No.</Label><Input id="listingAssociateLicenseNo" name="listingAssociateLicenseNo" placeholder="e.g., 1234567" defaultValue={defaults?.listingAssociateLicenseNo ?? ''} /></div></div>
                    <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="listingAssociateEmail">Your Email</Label><Input id="listingAssociateEmail" name="listingAssociateEmail" type="email" placeholder="you@example.com" defaultValue={defaults?.listingAssociateEmail ?? ''} /></div><div className="space-y-2"><Label htmlFor="listingAssociatePhone">Your Phone</Label><Input id="listingAssociatePhone" name="listingAssociatePhone" type="tel" placeholder="(512) 555-1234" defaultValue={defaults?.listingAssociatePhone ?? ''} /></div></div>
                     <div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="listingSupervisorName">Licensed Supervisor Name</Label><Input id="listingSupervisorName" name="listingSupervisorName" defaultValue={defaults?.listingSupervisorName ?? ''} /></div><div className="space-y-2"><Label htmlFor="listingSupervisorLicenseNo">Supervisor License No.</Label><Input id="listingSupervisorLicenseNo" name="listingSupervisorLicenseNo" defaultValue={defaults?.listingSupervisorLicenseNo ?? ''} /></div></div>
                  </div>
                </div>
                 <div>
                  <h3 className="text-md font-semibold mb-4 border-b pb-2">Other Defaults</h3>
                   <div className="space-y-2"><Label htmlFor="escrowAgentName">Preferred Title Company (Escrow Agent)</Label><Input id="escrowAgentName" name="escrowAgentName" placeholder="e.g., Texas National Title" defaultValue={defaults?.escrowAgentName ?? ''} /></div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
            <div className="text-sm">{state?.error && <p className="text-destructive">{state.error}</p>}{state?.success && <p className="text-green-600">{state.success}</p>}</div>
            <Button type="submit" disabled={isPending || isLoading}>{isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ('Save Defaults')}</Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}