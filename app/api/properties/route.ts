import { NextRequest, NextResponse } from 'next/server';
import { fetchProperties } from '@/lib/properties/queries';
import { Property } from '@/lib/properties/definitions';

export async function GET(request: NextRequest) {
  try {
    const properties: Property[] = await fetchProperties();
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}