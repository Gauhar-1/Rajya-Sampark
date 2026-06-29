import connectDB from '@/lib/db';
import issueService from '@/lib/services/issueService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/post/issue/candidate — Get issues for candidate
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const profileJson = searchParams.get('profile');
  const profile = profileJson ? JSON.parse(profileJson) : {};
  const issues = await issueService.getIssuesForCandidate(profile);
  return sendResponse(200, true, 'Candidate issues fetched successfully', { issues });
});
