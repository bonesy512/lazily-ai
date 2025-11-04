// lib/db/queries.ts

import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
// Import table objects (values)
import { activityLogs, teamMembers, teams, users, contracts, ActivityType, User } from './schema';
// Import TypeScript types separately for clarity
import type { Contract, Trec14ContractData } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// --- TYPE FOR NEW USER OBJECT ---
// This is the combined type that includes the teamId for all queries
export type UserWithTeamId = User & { teamId: number | null };


// ✅ FIX 1: UPDATED getUser function
// It now performs a LEFT JOIN on teamMembers to fetch teamId directly.
export async function getUser(): Promise<UserWithTeamId | null> {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  // --- BEGIN FIX: Join to get teamId ---
  const result = await db
    .select({
      // Select all user fields
      ...users,
      // Select the teamId from the joined teamMembers table
      teamId: teamMembers.teamId,
    })
    .from(users)
    // Left join teamMembers to ensure the user is returned even if they aren't in a team
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);
  // --- END FIX ---
    
  if (result.length === 0) {
    return null;
  }

  // The result is an object combining user and teamMembers data (UserWithTeamId)
  return result[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

// NOTE: This function is now mostly redundant with the new getUser(), but kept for compatibility.
export async function getUserWithTeam(userId: number) { 
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
      role: teamMembers.role,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);
  return result[0];
}

// ✅ FIX 2: Corrected getActivityLogs function
// Fetches logs for the entire team and handles unauthenticated users gracefully.
export async function getActivityLogs() {
  const user = await getUser(); // New user object has teamId
  if (!user || !user.teamId) {
    // Crucial: Return empty array instead of throwing to prevent 500/TypeError
    return []; 
  }

  // Fetch activity logs by the user's teamId
  const logs = await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.teamId, user.teamId)) // Filter by teamId (FIX)
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
    
  return logs;
}

// ✅ FIX 3: Simplified getTeamForUser function
// Uses the teamId directly from the new getUser() result, resolving the 500 error.
export async function getTeamForUser() {
  const user = await getUser();
  if (!user || !user.teamId) {
    return null;
  }

  // Fetch the Team object directly by teamId
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, user.teamId),
  });
  
  return team || null; // This will return the full team object needed by /api/team
}

// ✅ FIX 4: Simplified getContractsForUser function
// Removes the redundant call to getUserWithTeam.
export async function getContractsForUser(): Promise<Contract[]> {
    const user = await getUser();
    // New user object has teamId
    if (!user || !user.teamId) return [];
  
    try {
      const data = await db
        .select()
        .from(contracts)
        .where(eq(contracts.teamId, user.teamId))
        .orderBy(desc(contracts.generatedAt));
      return data;
    } catch (error) {
      console.error('Database Error fetching contracts:', error);
      throw new Error('Failed to fetch contracts.');
    }
}

export async function createContract(teamId: number, userId: number, contractData: Trec14ContractData) {
    return await db.insert(contracts).values({
        teamId,
        userId,
        contractData,
    }).returning();
}

export async function getTeamOwner(teamId: number): Promise<User | null> {
  const result = await db
    .select({ user: users })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'owner')))
    .limit(1);

  return result.length > 0 ? result[0].user : null;
}

export async function createActivityLog({
  teamId,
  userId,
  action,
  ipAddress,
}: {
  teamId: number;
  userId: number;
  action: ActivityType;
  ipAddress?: string;
}) {
  await db.insert(activityLogs).values({
    teamId,
    userId,
    action,
    ipAddress,
  });
}