'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSWRConfig } from 'swr';

export function CreditRefresher() {
  const { mutate } = useSWRConfig();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      mutate('/api/team/credits');
    }
  }, [success, mutate]);

  return null; // This component doesn't render anything
}