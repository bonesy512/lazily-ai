// components/dashboard/UploadErrorViewer.tsx

import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UploadErrorViewerProps {
  errors: string[];
}

export function UploadErrorViewer({ errors }: UploadErrorViewerProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 border-destructive bg-destructive/10">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <CardTitle className="text-destructive text-base">
          Upload Failed: Please fix the following {errors.length > 1 ? 'errors' : 'error'}:
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}