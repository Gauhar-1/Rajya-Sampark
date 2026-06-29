import connectDB from '@/lib/db';
import profileService from '@/lib/services/profileService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/profile — Get all profiles
export const GET = withErrorHandling(async () => {
  await requireAuth();
  await connectDB();
  const profiles = await profileService.getProfiles();
  return sendResponse(200, true, 'Profiles fetched successfully', { profiles });
});
