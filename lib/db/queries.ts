// lib/db/queries.ts

// ✅ FIX 1: Add getTableColumns to the import list
import { desc, and, eq, isNull, getTableColumns } from 'drizzle-orm';
import { db } from './drizzle';
// Import table objects (values)
import { activityLogs, teamMembers, teams, users, contracts, ActivityType, User } from './schema';
// Import TypeScript types separately for clarity
import type { Contract, Trec14ContractData } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// --- TYPE FOR NEW USER OBJECT ---
export type UserWithTeamId = User & { teamId: number | null };


// ✅ FIX 2: UPDATED getUser function to use getTableColumns
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

  // --- BEGIN FIX: Use getTableColumns to resolve type error (line 40) ---
  const result = await db
    .select({
      // Use getTableColumns(users) to spread ONLY the column definitions
      ...getTableColumns(users), 
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

  return result[0];
}


// --- REST OF THE FILE REMAINS THE SAME ---

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

export async function getActivityLogs() {
  const user = await getUser();
  if (!user || !user.teamId) {
    return []; 
  }

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
    .where(eq(activityLogs.teamId, user.teamId))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
    
  return logs;
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user || !user.teamId) {
    return null;
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, user.teamId),
  });
  
  return team || null;
}

export async function getContractsForUser(): Promise<Contract[]> {
    const user = await getUser();
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