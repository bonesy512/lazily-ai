'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from '@/lib/payments/actions';
import useSWR from 'swr';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { Suspense } from "react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// This component is re-used from the original dashboard page
function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>
          Your team is currently on the Lazily.AI Platform Access plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-lg">
                $19 / month
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

// A simple card for each credit pack
function CreditPack({ credits, price, discount }: { credits: number; price: number; discount: string }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{credits} Credits</CardTitle>
        <CardDescription>{discount}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button className="w-full">
          Purchase for ${price}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  return (
    <section>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        Subscription & Billing
      </h1>
      
      <div className="space-y-8">
        <Suspense fallback={<Card className="h-32 animate-pulse" />}>
          <ManageSubscription />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Contract Credits</CardTitle>
            <CardDescription>
              Buy credits in bulk for a discount. Each credit is good for one TREC-1-4 form generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <CreditPack credits={20} price={90} discount="10% Discount" />
            <CreditPack credits={50} price={185} discount="25% Discount" />
            <CreditPack credits={100} price={335} discount="33% Discount" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}