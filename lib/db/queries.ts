// lib/db/queries.ts (FULL CODE SNIPPET - Replace your existing file content)

import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
// Import table objects (values) - ensure 'properties' is here if you added it
import { activityLogs, teamMembers, teams, users, contracts, ActivityType, User, properties } from './schema';
// Import TypeScript types separately for clarity - ensure 'Property' and 'NewProperty' are here
import type { Contract, Trec14ContractData, Property, NewProperty } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// --- TYPE FOR NEW USER OBJECT ---
// This is the combined type that includes the teamId
export type UserWithTeamId = User & { teamId: number | null };


// 💡 FIX 1: UPDATED getUser function to include teamId via join
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
    
  if (result.length === 0) {
    return null;
  }

  // The result is an object combining user and teamMembers data
  return result[0];
}


// --- REST OF THE FILE REMAINS THE SAME (ensure you keep all other functions) ---

export async function getTeamByStripeCustomerId(customerId: string) { /* ... */ }
export async function updateTeamSubscription(teamId: number, subscriptionData: any) { /* ... */ }
// Note: getUserWithTeam is now redundant if the new getUser is used, but keep it for now.
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
export async function getActivityLogs() { /* ... */ }
export async function getTeamForUser() { /* ... */ }
export async function getContractsForUser(): Promise<Contract[]> { /* ... */ }
export async function createContract(teamId: number, userId: number, contractData: Trec14ContractData) { /* ... */ }
export async function getTeamOwner(teamId: number): Promise<User | null> { /* ... */ }
export async function createActivityLog({ teamId, userId, action, ipAddress }: { teamId: number; userId: number; action: ActivityType; ipAddress?: string; }) { /* ... */ }
// If you added createProperty previously, keep it here:
export async function createProperty(newProperty: NewProperty) { /* ... */ }