import connectDB from '@/lib/db';
import taskService from '@/lib/services/taskService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PATCH /api/task/[id]/status
export const PATCH = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { newStatus } = await req.json();
  const task = await taskService.updateStatus(id, newStatus);
  return sendResponse(200, true, 'Task status updated successfully', { task });
});
