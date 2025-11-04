// lib/auth/action-helpers.ts (formerly middleware.ts)
import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  validationErrors?: string[];
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

/**
 * Higher-Order Function (HOF) to wrap server actions with Zod schema validation.
 */
export function createValidatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

/**
 * HOF to wrap server actions with Zod schema validation and user authentication.
 */
export function createValidatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData, user);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

/**
 * HOF to wrap server actions, requiring a team object with members to be passed.
 * NOTE: The type assertion here resolves the current build error, but you MUST
 * ensure that 'getTeamForUser()' in '@/lib/db/queries' is implemented with Drizzle's
 * relational fetching (e.g., using 'with: { teamMembers: true }') to actually
 * fetch the required data.
 */
export function createActionWithTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Call the function expected to return TeamDataWithMembers
    const team = await getTeamForUser(); 
    if (!team) {
      throw new Error('Team not found');
    }

    // 🛠️ FIX: Type assertion to resolve the compilation error.
    return action(formData, team as TeamDataWithMembers);
  };
}