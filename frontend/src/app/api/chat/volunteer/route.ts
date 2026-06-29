import connectDB from '@/lib/db';
import chatService from '@/lib/services/chatService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/chat/volunteer — Get groups for a volunteer
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone') || '';
  const groups = await chatService.getGroupsForVolunteer(phone);
  return sendResponse(200, true, 'Groups fetched successfully', { groups });
});
