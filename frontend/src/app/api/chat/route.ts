import connectDB from '@/lib/db';
import chatService from '@/lib/services/chatService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// POST /api/chat — Create a group
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const body = await req.json();
  const { profile, ...groupData } = body;
  const newGroup = await chatService.createGroup(profile, groupData);
  return sendResponse(200, true, 'Group created successfully', { newGroup });
});

// GET /api/chat — Get groups for a candidate
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get('profileId') || '';
  const groups = await chatService.getGroups(profileId);
  return sendResponse(200, true, 'Groups fetched successfully', { groups });
});
