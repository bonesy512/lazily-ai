// components/dashboard/DownloadContractButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
// This assumes you updated the import in the previous step
import { downloadExistingContract } from '@/app/(dashboard)/dashboard/contracts/actions'; 

export function DownloadContractButton({ contractId, contractAddress }: { contractId: number; contractAddress: string | null }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // 1. Call the server action to get the PDF bytes (as number[])
      const pdfBytes = await downloadExistingContract(contractId);
      
      // 2. FIX: Convert the received number[] back to a Uint8Array (binary type)
      const uint8Array = new Uint8Array(pdfBytes);
      
      // 3. Use the browser to create a downloadable file from the binary data
      // The Blob constructor now correctly receives a Uint8Array, resolving the TypeScript error.
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TREC_Contract_${contractAddress || contractId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </>
      )}
    </Button>
  );
}