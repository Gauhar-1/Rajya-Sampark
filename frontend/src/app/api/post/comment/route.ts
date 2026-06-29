import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// POST /api/post/comment — Post a comment
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { content, timestamp, postId, profile } = await req.json();
  const comment = await postService.postComment(profile, postId, content, timestamp);
  return sendResponse(200, true, 'Comment posted successfully', { populatedComment: comment });
});
