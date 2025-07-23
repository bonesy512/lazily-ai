// app/api/team/credits/route.ts

import { getTeamForUser } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const team = await getTeamForUser();

    if (!team) {
      return new NextResponse('Team not found', { status: 404 });
    }

    return NextResponse.json({ credits: team.contractCredits });
  } catch (error) {
    console.error('Failed to fetch credits:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}