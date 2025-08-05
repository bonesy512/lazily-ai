// components/dashboard/PropertyList.tsx

import { fetchProperties } from '@/lib/properties/queries';

export async function PropertyList() {
  const properties = await fetchProperties();

  return (
    <div className="border-t">
      {properties.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No properties found.</p>
      ) : (
        <ul className="divide-y divide-border">
          {properties.map((property) => (
            <li key={property.id} className="p-4">
              <p className="font-medium">{property.streetAddress}</p>
              <p className="text-sm text-muted-foreground">
                {property.city}, TX {property.zipCode}
              </p>
              <p className="text-sm text-muted-foreground">Offer Price: ${property.offerPrice}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}