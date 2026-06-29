import connectDB from '@/lib/db';
import postService from '@/lib/services/postService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/post — Get feed (PUBLIC)
export const GET = withErrorHandling(async (req: Request) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const paginatedFeed = await postService.getFeed(page, limit);
  return sendResponse(200, true, 'Feed fetched successfully', { paginatedFeed });
});

// POST /api/post — Create a post
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { title, content, itemType, mediaUrl, profile } = await req.json();
  const post = await postService.createPost(title, profile, content, itemType, mediaUrl);
  return sendResponse(200, true, 'Post created successfully', { populatedPost: post });
});
