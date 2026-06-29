import connectDB from '@/lib/db';
import profileService from '@/lib/services/profileService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/profile/[id]
export const GET = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const profile = await profileService.getProfile(id);
  return sendResponse(200, true, 'Profile fetched successfully', { profile });
});
