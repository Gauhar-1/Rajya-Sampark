import connectDB from '@/lib/db';
import profileService from '@/lib/services/profileService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/profile/[id]/role
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { newRole } = await req.json();
  const user = await profileService.updateUserRole(id, newRole);
  return sendResponse(200, true, 'User role updated', { user });
});
