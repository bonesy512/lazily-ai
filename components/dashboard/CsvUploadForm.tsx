// components/dashboard/CsvUploadForm.tsx

'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { processCsvFile } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import { UploadErrorViewer } from './UploadErrorViewer'; // Import the new component
import { Download, UploadCloud } from 'lucide-react';

export function CsvUploadForm() {
  const [state, formAction, isPending] = useActionState<ActionState>(processCsvFile as any, { error: '', validationErrors: [] });

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="csv-upload">Upload Your CSV File</Label>
          <div className="flex flex-col sm:flex-row gap-4 mt-1">
            <Input id="csv-upload" name="csvFile" type="file" accept=".csv" required className="max-w-xs" />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                'Uploading...'
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload and Process
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-sm text-muted-foreground">
          Don't have the template? Download it here to get started.
        </p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/templates/lazily-ai-template.csv" download>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Link>
        </Button>
      </div>

      {/* Display errors using the new component */}
      {state?.error && <UploadErrorViewer errors={[state.error]} />}
      {state?.validationErrors && <UploadErrorViewer errors={state.validationErrors} />}
      
      {state?.success && <p className="mt-4 text-green-600">{state.success}</p>}
    </div>
  );
}