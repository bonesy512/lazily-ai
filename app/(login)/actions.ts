// app/(login)/actions.ts

'use server';

import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import Papa from 'papaparse';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  invitations,
  contracts, // Import contracts table
  type NewUser,
  type NewTeam,
  type NewTeamMember,
  type NewActivityLog,
  type Trec14ContractData, // Import the TS Type
  ActivityType,
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser,
} from '@/lib/auth/middleware';
import { Trec14Schema } from '@/lib/contracts/validation'; // Import Zod Validator
import { mapCsvRowToJson } from '@/lib/contracts/transformation'; // Import CSV Transformer

// --- All other actions (signIn, signUp, signOut, etc.) remain unchanged ---
// (The full file content is provided for safe replacement)

// --- START: Existing Actions (No changes needed here) ---

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});
export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  const userWithTeam = await db
    .select({ user: users, team: teams })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);
  if (userWithTeam.length === 0) {
    return { error: 'Invalid email or password. Please try again.', email, password };
  }
  const { user: foundUser, team: foundTeam } = userWithTeam[0];
  const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);
  
  if (!isPasswordValid) {
    return { error: 'Invalid email or password. Please try again.', email, password };
  }
  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
  ]);
  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: foundTeam, priceId });
  }
  redirect('/dashboard');
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional()
});
export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return { error: 'An account with this email already exists.', email, password };
  }
  const passwordHash = await hashPassword(password);
  const newUser: NewUser = { email, passwordHash, role: 'owner' };
  const [createdUser] = await db.insert(users).values(newUser).returning();
  if (!createdUser) {
    return { error: 'Failed to create user. Please try again.', email, password };
  }
  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;
  if (inviteId) {
    const [invitation] = await db.select().from(invitations).where(and(eq(invitations.id, parseInt(inviteId)), eq(invitations.email, email), eq(invitations.status, 'pending'))).limit(1);
    if (invitation) {
      teamId = invitation.teamId;
      userRole = invitation.role;
      await db.update(invitations).set({ status: 'accepted' }).where(eq(invitations.id, invitation.id));
      await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);
      [createdTeam] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
    } else {
      return { error: 'Invalid or expired invitation.', email, password };
    }
  } else {
    const newTeam: NewTeam = { name: `${email}'s Team` };
    [createdTeam] = await db.insert(teams).values(newTeam).returning();
    if (!createdTeam) {
      return { error: 'Failed to create team. Please try again.', email, password };
    }
    teamId = createdTeam.id;
    userRole = 'owner';
    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }
  const newTeamMember: NewTeamMember = { userId: createdUser.id, teamId: teamId, role: userRole };
  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser)
  ]);
  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ team: createdTeam, priceId });
  }
  redirect('/dashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});
export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;
    const isPasswordValid = await comparePasswords(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return { currentPassword, newPassword, confirmPassword, error: 'Current password is incorrect.' };
    }
    if (currentPassword === newPassword) {
      return { currentPassword, newPassword, confirmPassword, error: 'New password must be different from the current password.' };
    }
    if (confirmPassword !== newPassword) {
      return { currentPassword, newPassword, confirmPassword, error: 'New password and confirmation password do not match.' };
    }
    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);
    await Promise.all([
      db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
    ]);
    return { success: 'Password updated successfully.' };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});
export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { password, error: 'Incorrect password. Account deletion failed.' };
    }
    const userWithTeam = await getUserWithTeam(user.id);
    await logActivity(userWithTeam?.teamId, user.id, ActivityType.DELETE_ACCOUNT);
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`
      })
      .where(eq(users.id, user.id));
    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }
    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  marketingEmailConsent: z.enum(['on', 'off']).optional(),
  marketingSmsConsent: z.enum(['on', 'off']).optional()
});
export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, phone, marketingEmailConsent, marketingSmsConsent } = data;
    const userWithTeam = await getUserWithTeam(user.id);
    await Promise.all([
      db.update(users).set({ 
        name,
        phone,
        marketingEmailConsent: marketingEmailConsent === 'on',
        marketingSmsConsent: marketingSmsConsent === 'on'
      }).where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);
    return { name, success: 'Account updated successfully.' };
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.coerce.number()
});
export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }
    if (userWithTeam.role !== 'owner') {
      return { error: 'You do not have permission to remove team members.' };
    }
    await db.delete(teamMembers).where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, userWithTeam.teamId)));
    await logActivity(userWithTeam.teamId, user.id, ActivityType.REMOVE_TEAM_MEMBER);
    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});
export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }
    const existingMember = await db.select().from(users).leftJoin(teamMembers, eq(users.id, teamMembers.userId)).where(and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))).limit(1);
    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }
    const existingInvitation = await db.select().from(invitations).where(and(eq(invitations.email, email), eq(invitations.teamId, userWithTeam.teamId), eq(invitations.status, 'pending'))).limit(1);
    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }
    await db.insert(invitations).values({ teamId: userWithTeam.teamId, email, role, invitedBy: user.id, status: 'pending' });
    await logActivity(userWithTeam.teamId, user.id, ActivityType.INVITE_TEAM_MEMBER);
    return { success: 'Invitation sent successfully' };
  }
);
// --- END: Existing Actions ---


// --- THIS IS THE NEW, REFACTORED ACTION ---
const processCsvSchema = z.object({
  csvFile: z.any().refine(file => file?.size > 0, 'CSV file is required.'),
});

export const processCsvFile = validatedActionWithUser(
  processCsvSchema,
  async (data, formData, user) => {
    const file = formData.get('csvFile') as File;

    // 1. Authorization & Parsing
    const userWithTeam = await getUserWithTeam(user.id);
    if (!userWithTeam?.teamId) {
      return { error: 'Authentication error: Could not find your team information.' };
    }
    const team = await db.query.teams.findFirst({ where: eq(teams.id, userWithTeam.teamId) });
    if (!team) {
      return { error: 'Database error: Could not load your team data.' };
    }
    
    const csvText = await file.text();
    const parsedCsv = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const rows = parsedCsv.data as Record<string, string>[];

    if (rows.length === 0) {
      return { error: 'The uploaded CSV file has no data rows.' };
    }

    // 2. Credit Check
    const requiredCredits = rows.length;
    if (team.contractCredits < requiredCredits) {
      return { error: `You do not have enough credits. This upload requires ${requiredCredits} credits, but you only have ${team.contractCredits}.` };
    }

    // 3. Iteration, Transformation, and Validation
    const validationErrors: string[] = [];
    const validatedData: Trec14ContractData[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const transformedJson = mapCsvRowToJson(row);
      const result = Trec14Schema.safeParse(transformedJson);

      if (!result.success) {
        // Format Zod errors for user-friendliness
        const formattedErrors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        validationErrors.push(`Row ${i + 2}: ${formattedErrors}`); // i + 2 accounts for header row and 0-index
      } else {
        validatedData.push(result.data);
      }
    }

    // 4. Error Handling
    if (validationErrors.length > 0) {
      return { error: 'Validation failed. Please correct the errors in your CSV and try again.', validationErrors };
    }

    // 5. Atomic Transaction
    try {
      const newCreditTotal = team.contractCredits - requiredCredits;
      await db.transaction(async (tx) => {
        // Persist new contracts
        const newContractsToInsert = validatedData.map(data => ({
          teamId: team.id,
          userId: user.id,
          contractData: data, // Storing the validated JSON object
        }));
        
        if (newContractsToInsert.length > 0) {
            await tx.insert(contracts).values(newContractsToInsert);
        }

        // Deduct credits
        await tx.update(teams).set({ contractCredits: newCreditTotal }).where(eq(teams.id, team.id));
      });
      // 6. Success
      return { success: `Successfully validated and saved ${requiredCredits} contracts. Your new credit balance is ${newCreditTotal}.` };
    } catch (e: any) {
      console.error("Database transaction failed:", e);
      return { error: 'A database error occurred while saving your contracts. Please try again.' };
    }
  }
);