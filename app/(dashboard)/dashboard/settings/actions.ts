// app/(dashboard)/dashboard/settings/actions.ts

'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { teamContractDefaults } from '@/lib/db/schema';
import { createValidatedActionWithUser } from '@/lib/auth/action-helpers';
import { getUserWithTeam } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

const defaultsSchema = z.object({
  // Listing Broker
  listingFirmName: z.string().optional(),
  listingFirmLicenseNo: z.string().optional(),
  listingAssociateName: z.string().optional(),
  listingAssociateLicenseNo: z.string().optional(),
  listingAssociateEmail: z.string().optional(),
  listingAssociatePhone: z.string().optional(),
  listingSupervisorName: z.string().optional(),
  listingSupervisorLicenseNo: z.string().optional(),
  listingBrokerAddress: z.string().optional(),
  // Other Broker
  otherFirmName: z.string().optional(),
  otherFirmLicenseNo: z.string().optional(),
  otherAssociateName: z.string().optional(),
  otherAssociateLicenseNo: z.string().optional(),
  // Other
  escrowAgentName: z.string().optional(),
});

export const updateTeamDefaults = createValidatedActionWithUser(
  defaultsSchema,
  async (data, formData, user) => {
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'You must be part of a team to save defaults.' };
    }

    try {
      await db
        .insert(teamContractDefaults)
        .values({
          teamId: userWithTeam.teamId,
          ...data,
        })
        .onConflictDoUpdate({
          target: teamContractDefaults.teamId,
          set: {
            ...data,
            updatedAt: new Date(),
          },
        });

      revalidatePath('/dashboard/settings/defaults');
      return { success: 'Your contract defaults have been saved successfully.' };

    } catch (error) {
      console.error('Failed to update team defaults:', error);
      return { error: 'A database error occurred. Please try again.' };
    }
  }
);