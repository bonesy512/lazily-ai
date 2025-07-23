// components/dashboard/CreditsCounter.tsx

'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CreditsCounter() {
  // This hook now points to the correct, non-conflicting API route
  const { data, error } = useSWR('/api/team/credits', fetcher);

  const credits = data?.credits;

  if (error) return <div>Failed to load credits</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
        <FileText className="h-4 w-4 text-muted-foreground" />
      </-cardheader>
      <CardContent>
        <div className="text-2xl font-bold">
          {credits !== undefined ? credits : '...'}
        </div>
        <p className="text-xs text-muted-foreground">
          1 credit is used per generated contract.
        </p>
      </CardContent>
    </Card>
  );
}