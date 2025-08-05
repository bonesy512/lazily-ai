// components/dashboard/ContractList.tsx

import { getContractsForUser } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export async function ContractList() {
  const userContracts = await getContractsForUser();

  return (
    <div className="border-t">
      {userContracts.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No contracts found.</p>
      ) : (
        <ul className="divide-y divide-border">
          {userContracts.map((contract) => (
            <li key={contract.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {/* We now pull data from the contractData JSON object */}
                  {contract.contractData.property?.address || 'Address not available'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Seller: {contract.contractData.parties?.seller || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Sales Price: ${contract.contractData.price?.salesPrice || 'N/A'}
                </p>
              </div>
              <div>
                <Button variant="outline" size="sm" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}