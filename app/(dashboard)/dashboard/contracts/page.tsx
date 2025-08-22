// app/(dashboard)/dashboard/contracts/page.tsx

// Removed CsvUploadForm import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditsCounter } from "@/components/dashboard/CreditsCounter";
import { ContractList } from '@/components/dashboard/ContractList';
import { CreditRefresher } from '@/components/dashboard/CreditRefresher';
import { Suspense } from 'react';
// Import the new SingleContractForm
// Note: The path assumes the structure established in previous phases (components/dashboard/contracts/...)
import { SingleContractForm } from '@/components/dashboard/contracts/SingleContractForm';

export default async function ContractsPage() {
  return (
    <section className="space-y-6">
      <Suspense fallback={null}>
        <CreditRefresher />
      </Suspense>
      
      {/* Keep the credit counter visible */}
      <div className="grid gap-4 md:grid-cols-4">
        <CreditsCounter />
      </div>

      {/* DEPLOY NEW UI: Render the SingleContractForm */}
      {/* The form component handles its own internal layout, header, and styling */}
      <div className="pt-4">
        <SingleContractForm />
      </div>

      {/* Existing Contract List remains for viewing history */}
      {/* We wrap this in a container matching the form's width for visual consistency */}
      <div className="max-w-5xl mx-auto py-8 px-4">
        <Card>
            <CardHeader>
            <CardTitle>Generated Contracts History</CardTitle>
            <CardDescription>
                Contracts you have previously generated will appear here.
            </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
            <ContractList />
            </CardContent>
        </Card>
      </div>
    </section>
  );
}