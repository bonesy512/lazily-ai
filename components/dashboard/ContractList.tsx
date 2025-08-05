// components/dashboard/ContractList.tsx

import { getContractsForUser } from '@/lib/db/queries';
import { Trec14ContractData } from '@/lib/contracts/validation';
import { DownloadContractButton } from './DownloadContractButton'; // Import the new button

export async function ContractList() {
  const userContracts = await getContractsForUser();

  return (
    <div className="border-t">
      {userContracts.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No contracts found.</p>
      ) : (
        <ul className="divide-y divide-border">
          {userContracts.map((contract) => {
            const data = contract.contractData as Trec14ContractData;

            return (
              <li key={contract.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {data.property?.address || 'Address not available'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Seller: {data.parties?.seller || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sales Price: ${data.price?.salesPrice || 'N/A'}
                  </p>
                </div>
                <div>
                  {/* Use the new, functional button */}
                  <DownloadContractButton 
                    contractId={contract.id} 
                    contractAddress={data.property?.address || null}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}