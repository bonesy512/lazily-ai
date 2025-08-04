import { db } from '../db/drizzle';
import { properties } from '../db/schema';
import { Property } from './definitions';

export async function fetchProperties(): Promise<Property[]> {
  try {
    const data = await db.select().from(properties);
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch properties.');
  }
}
