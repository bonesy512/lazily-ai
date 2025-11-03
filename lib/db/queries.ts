// lib/db/queries.ts

import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
// Import table objects (values)
// 💡 FIX 1: Added 'properties' and its type 'Property' and 'NewProperty' to imports
import { activityLogs, teamMembers, teams, users, contracts, ActivityType, User, properties } from './schema';
// Import TypeScript types separately for clarity
import type { Contract, Trec14ContractData, Property, NewProperty } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
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

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);
  if (user.length === 0) {
    return null;
  }

  return user[0];
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
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const result = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, user.id),
    with: {
      team: {
        with: {
          teamMembers: {
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }
    }
  });
  return result?.team || null;
}

// Fetches from the correct 'contracts' table
export async function getContractsForUser(): Promise<Contract[]> {
    const user = await getUser();
    if (!user) return [];
  
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) return [];
  
    try {
      const data = await db
        .select()
        .from(contracts)
        .where(eq(contracts.teamId, userWithTeam.teamId))
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

// 💡 NEW FUNCTION: Placeholder for future property queries, demonstrating use of new types
export async function createProperty(newProperty: NewProperty) {
    return await db.insert(properties).values(newProperty).returning();
}