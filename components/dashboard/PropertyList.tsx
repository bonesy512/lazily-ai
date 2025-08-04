'use client';

import useSWR from 'swr';
import { fetchProperties } from '@/lib/properties/queries';
import { Property } from '@/lib/definitions';

export function PropertyList() {
  const { data: properties, error } = useSWR<Property[]>('/api/properties', fetchProperties);

  if (error) return <div>Failed to load properties.</div>;
  if (!properties) return <div>Loading...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Properties</h2>
      {properties.length === 0 ? (
        <p>No properties found.</p>
      ) : (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li key={property.id} className="p-4 border rounded-lg">
              <p className="font-bold">{property.address}</p>
              <p>{property.city}, {property.state} {property.zip}</p>
              <p>Price: ${property.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
