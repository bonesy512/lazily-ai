// app/api/team/defaults/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { teamContractDefaults } from '@/lib/db/schema';
import { getTeamForUser } from '@/lib/db/queries';

export async function GET() {
  try {
    const team = await getTeamForUser();

    if (!team) {
      return new NextResponse('User is not part of a team.', { status: 404 });
    }

    const defaults = await db.query.teamContractDefaults.findFirst({
      where: eq(teamContractDefaults.teamId, team.id),
    });

    if (!defaults) {
        // Return an empty object if no defaults are set yet, which is not an error
        return NextResponse.json({});
    }

    return NextResponse.json(defaults);

  } catch (error) {
    console.error('Failed to fetch contract defaults:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}