import connectDB from '@/lib/db';
import issueService from '@/lib/services/issueService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/post/issue — Get issue posts for current user
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const profileJson = searchParams.get('profile');
  const profile = profileJson ? JSON.parse(profileJson) : {};
  const posts = await issueService.getIssuePost(profile);
  if (posts.length === 0) {
    return sendResponse(200, true, 'No issues assigned to this user.', { posts: [] });
  }
  return sendResponse(200, true, 'Issue posts fetched successfully', { posts });
});

// POST /api/post/issue — Take post as issue
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { id, profile } = await req.json();
  await issueService.takePostAsIssue(profile, id);
  return sendResponse(200, true, 'Successful');
});
