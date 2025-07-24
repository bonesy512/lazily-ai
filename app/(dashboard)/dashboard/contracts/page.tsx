'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, Download } from "lucide-react";
import { useActionState, useEffect, useState } from 'react';
import { processCsvFile } from '@/app/(login)/actions';
import { generateContractAction } from './actions';
import { CreditsCounter } from "@/components/dashboard/CreditsCounter";
import { Property, Owner } from '@/lib/db/schema';
import useSWR from "swr";

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// New component to display a single property row
function PropertyRow({ property }: { property: Property & { owner: Owner | null } }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const pdfBytes = await generateContractAction(property.id);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TREC_Contract_${property.streetAddress}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate PDF. See console for details.");
        }
        setIsGenerating(false);
    };

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div>
                <p className="font-medium">{property.streetAddress}, {property.city}</p>
                <p className="text-sm text-muted-foreground">Owner: {property.owner?.fullName || 'N/A'}</p>
            </div>
            <Button onClick={handleDownload} disabled={isGenerating} size="sm">
                {isGenerating ? 'Generating...' : <><Download className="mr-2 h-4 w-4" /> Download PDF</>}
            </Button>
        </div>
    );
}


export default function ContractsPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(processCsvFile, {});
  // Fetch properties for the current team
  const { data: properties, error, mutate } = useSWR('/api/properties', fetcher);

  // When a CSV is successfully uploaded, refresh the properties list
  useEffect(() => {
    if (state.success) {
      mutate();
    }
  }, [state.success, mutate]);

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
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">CSV File</Label>
              <div className="flex items-center gap-4">
                <Input id="csv-upload" name="csvFile" type="file" accept=".csv" required className="max-w-xs" />
                <Button type="submit" disabled={isPending}>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {isPending ? 'Uploading...' : 'Upload and Process'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required columns: StreetAddress, City, ZipCode, OwnerName, OfferPrice...
              </p>
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.success && <p className="text-sm text-green-600">{state.success}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Contracts</CardTitle>
          <CardDescription>
            Properties you've uploaded will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            {error && <div className="p-4">Failed to load properties.</div>}
            {!properties && !error && <div className="p-4">Loading properties...</div>}
            {properties && properties.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-12 border-t">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                    No properties uploaded yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                    Upload a CSV file to see your properties here.
                    </p>
                </div>
            )}
            {properties && properties.length > 0 && (
                <div>
                    {properties.map((prop: any) => (
                        <PropertyRow key={prop.id} property={prop} />
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
    </section>
  );
}