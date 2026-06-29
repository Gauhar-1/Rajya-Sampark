import { auth } from '@clerk/nextjs/server';
import { AppError } from '@/lib/api-utils';

/**
 * Retrieves the authenticated user's Clerk session info for use in API route handlers.
 * Throws a 401 AppError if the user is not authenticated.
 */
export async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new AppError(401, 'Authentication required. Please sign in.');
  }

  return { userId };
}

/**
 * Checks if the user has one of the allowed roles.
 * Note: In this codebase, roles come from the Profile model (via JWT), not Clerk metadata.
 * Since we're migrating to Clerk, this helper uses Clerk's session claims.
 * For now, role checking is done at the service layer where the profile is fetched.
 * This function serves as the auth gate — role-based checks remain in the route handlers.
 */
export async function requireAuth() {
  return getAuthenticatedUser();
}
