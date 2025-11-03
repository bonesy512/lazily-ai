// app/(dashboard)/dashboard/contracts/page.tsx

import { ContractList } from '@/components/dashboard/ContractList';
import { CreditRefresher } from '@/components/dashboard/CreditRefresher';
import { CreditsCounter } from '@/components/dashboard/CreditsCounter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function ContractsPage() {
  return (
    <section className="space-y-6">
      <Suspense fallback={null}>
        <CreditRefresher />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create a New Contract</CardTitle>
                <CardDescription>
                  Use our guided form to generate a single, error-free TREC contract.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/contracts/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New
                </Link>
              </Button>
            </CardHeader>
          </Card>
        </div>
        <CreditsCounter />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Contracts</CardTitle>
          <CardDescription>
            Contracts you've created will appear here, ready for download.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ContractList />
        </CardContent>
      </Card>
    </section>
  );
}