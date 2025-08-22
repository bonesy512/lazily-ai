// In /app/(dashboard)/dashboard/billing/page.tsx

'use client'; // <-- THIS MUST BE THE FIRST LINE

export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction, creditCheckoutAction } from '@/lib/payments/actions';
import useSWR, { useSWRConfig } from 'swr';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { Suspense, useEffect } from "react";
import { useFormStatus } from 'react-dom';
import { CreditsCounter } from "@/components/dashboard/CreditsCounter";
import { useSearchParams } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>
          Your $10/month subscription gives you access to the Lazily.AI platform and all its features.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-lg">
                $10 / month
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                Status: {teamData?.subscriptionStatus || '...'}
              </p>
            </div>
            <form action={customerPortalAction}>
              <Button type="submit" variant="outline">
                Manage Subscription
              </Button>
            </form>
          </div>
      </CardContent>
    </Card>
  );
}

function PurchaseButton({ price }: { price: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Processing..." : `Purchase for $${price}`}
    </Button>
  );
}

function CreditPack({ credits, price, discount, priceId }: { credits: number; price: number; discount: string; priceId: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{credits} Credits</CardTitle>
        <CardDescription>{discount}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <form action={creditCheckoutAction} className="w-full">
          <input type="hidden" name="priceId" value={priceId} />
          <PurchaseButton price={price} />
        </form>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const { mutate } = useSWRConfig();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      mutate('/api/team/credits');
    }
  }, [success, mutate]);

  return (
    <section>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        Subscription & Billing
      </h1>

      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
                <CreditsCounter />
            </div>
        </div>

        <Suspense fallback={<Card className="h-32 animate-pulse" />}>
          <ManageSubscription />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Contract Credits</CardTitle>
            <CardDescription>
              One credit is used for each TREC 1-4 form you generate. For example, uploading a CSV with 20 rows will require 20 credits.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <CreditPack credits={20} price={90} discount="10% Discount" priceId="price_1Ro7OYPnNiwcL8wH91lgBFm1" />
            <CreditPack credits={50} price={185} discount="25% Discount" priceId="price_1Ro7a1PnNiwcL8wH0Ok54dwB" />
            <CreditPack credits={100} price={335} discount="33% Discount" priceId="price_1Ro7aKPnNiwcL8wHErefGhbq" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}