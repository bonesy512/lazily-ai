// app/api/properties/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { getTeamForUser } from '@/lib/db/queries';
import { properties } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// The 'export' keyword here is the fix.
export async function GET() {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    const teamProperties = await db.query.properties.findMany({
      where: eq(properties.teamId, team.id),
      with: {
        owner: true,
      },
      orderBy: (properties, { desc }) => [desc(properties.createdAt)],
    });
    
    return NextResponse.json(teamProperties);
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}