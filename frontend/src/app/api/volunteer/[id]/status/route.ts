import connectDB from '@/lib/db';
import volunteerService from '@/lib/services/volunteerService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/volunteer/[id]/status
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { status } = await req.json();
  const updated = await volunteerService.updateVolunteerStatus(id, status);
  return sendResponse(200, true, 'Volunteer status updated successfully', { updated });
});
