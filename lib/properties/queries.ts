// lib/properties/queries.ts

import { db } from '../db/drizzle';
import { properties, type Property } from '../db/schema'; // CORRECTED IMPORT

export async function fetchProperties(): Promise<Property[]> {
  try {
    const data = await db.select().from(properties);
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch properties.');
  }
}