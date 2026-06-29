import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// POST /api/post/poll — Create a poll
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { title, pollQuestion, pollOptions, profile } = await req.json();
  const poll = await postService.createPoll(title, profile, pollQuestion, pollOptions);
  return sendResponse(200, true, 'Poll created successfully', { populatedPoll: poll });
});
