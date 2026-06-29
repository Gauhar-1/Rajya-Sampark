import connectDB from '@/lib/db';
import issueService from '@/lib/services/issueService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/post/issue/[id] — Take permission for issue post
export const PATCH = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  await issueService.takePermissionForIssuePost(id);
  return sendResponse(200, true, 'Successfully sent the Req');
});

// DELETE /api/post/issue/[id] — Delete issue post
export const DELETE = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  await issueService.deleteIssuePost(id);
  return sendResponse(200, true, 'Issue post deleted successfully');
});
