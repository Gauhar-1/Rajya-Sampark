import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/post/[id]/vote — Vote on a poll
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { optionId, profile } = await req.json();
  const poll = await postService.votePoll(profile, id, optionId);
  return sendResponse(200, true, 'Voted successfully', { poll });
});
