import connectDB from '@/lib/db';
import profileService from '@/lib/services/profileService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/profile/[id]/status
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { newStatus } = await req.json();
  const user = await profileService.updateUserStatus(id, newStatus);
  return sendResponse(200, true, 'User status updated', { user });
});
