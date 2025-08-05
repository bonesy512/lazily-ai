import { fetchProperties } from '@/lib/properties/queries';

export async function PropertyList() {
  const properties = await fetchProperties();

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
              <p>
                {property.city}, {property.state} {property.zip}
              </p>
              <p>Price: ${property.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
