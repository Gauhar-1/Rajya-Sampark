import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/post/[id]/like — Like/unlike a post
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { action, profile } = await req.json();
  const likeCount = await postService.updateLikes(profile, id, action);
  return sendResponse(200, true, 'Likes updated successfully', { likeCount });
});
