import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';

// GET /api/post/[id] — Get a single post/poll by ID (PUBLIC)
export const GET = withErrorHandling(async (_req: Request, context) => {
  await connectDB();
  const { id } = await context!.params;
  const post = await postService.getFeedById(id);
  return sendResponse(200, true, 'Post fetched successfully', { post });
});
