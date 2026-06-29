import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/post/[id]/comment — Get comments for a post
export const GET = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const comments = await postService.getComments(id);
  return sendResponse(200, true, 'Comments fetched successfully', { comments });
});
