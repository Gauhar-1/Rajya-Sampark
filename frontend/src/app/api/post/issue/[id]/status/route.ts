import connectDB from '@/lib/db';
import issueService from '@/lib/services/issueService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/post/issue/[id]/status — Give permission for issue post
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { status } = await req.json();
  await issueService.givePermissionForIssuePost(id, status);
  return sendResponse(200, true, `Successfully changed the status to ${status}`);
});
