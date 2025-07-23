'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText } from "lucide-react";
import { useActionState, Suspense } from 'react';
import { processCsvFile } from '@/app/(login)/actions';
import { CreditsCounter } from "@/components/dashboard/CreditsCounter"; // This line is now correct

type ActionState = {
  error?: string;
  success?: string;
};

export default function ContractsPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(processCsvFile, {});

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Suspense fallback={<Card className="h-32 animate-pulse" />}>
          <CreditsCounter />
        </Suspense>
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
            Your generated TREC forms will appear here after processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-border rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No files processed yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Upload a CSV file to begin generating your contracts.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}