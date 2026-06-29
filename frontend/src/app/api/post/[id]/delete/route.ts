import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// DELETE /api/post/[id]/delete — Delete a post
export const DELETE = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { profile } = await req.json();
  await postService.deletePost(profile, id);
  return sendResponse(200, true, 'Post deleted successfully');
});
