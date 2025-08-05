// components/dashboard/CsvUploadForm.tsx

'use client';

import { useActionState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { processCsvFile } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';

export function CsvUploadForm() {
  const [state, formAction, isPending] = useActionState<ActionState>(processCsvFile as any, { error: '', validationErrors: [] });
  
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="csv-upload">CSV File</Label>
        <Input id="csv-upload" name="csvFile" type="file" accept=".csv" required className="max-w-xs" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Uploading...' : 'Upload CSV'}
      </Button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.validationErrors && (
        <div className="text-red-500">
          <p>Validation failed:</p>
          <ul className="list-disc list-inside">
            {state.validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {state?.success && <p className="text-green-500">{state.success}</p>}
    </form>
  );
}