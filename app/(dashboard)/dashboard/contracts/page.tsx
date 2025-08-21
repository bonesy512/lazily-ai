'use client';

import { CsvUploadForm } from '@/components/dashboard/CsvUploadForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditsCounter } from "@/components/dashboard/CreditsCounter";
import { ContractList } from '@/components/dashboard/ContractList';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useSWRConfig } from 'swr';

function Contracts() {
  const { mutate } = useSWRConfig();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      mutate('/api/team/credits');
    }
  }, [success, mutate]);

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <CreditsCounter />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Property List</CardTitle>
          <CardDescription>
            Upload a CSV file with your property and owner data. A TREC 1-4 form will be generated for each row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CsvUploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Contracts</CardTitle>
          <CardDescription>
            Contracts you've created from a CSV upload will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ContractList />
        </CardContent>
      </Card>
    </section>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Contracts />
    </Suspense>
  );
}