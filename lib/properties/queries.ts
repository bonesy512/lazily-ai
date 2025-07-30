import { Property } from './definitions';

// This is a mock function. You can replace it with your actual database query.
export async function fetchProperties(): Promise<Property[]> {
  console.log('Fetching properties data...');
  // Simulate a database delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const mockProperties: Property[] = [
    {
      id: '1',
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      price: 500000,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      id: '2',
      address: '456 Oak Ave',
      city: 'Manor',
      state: 'TX',
      zip: '78653',
      price: 350000,
      bedrooms: 4,
      bathrooms: 2.5,
    },
  ];

  return mockProperties;
}