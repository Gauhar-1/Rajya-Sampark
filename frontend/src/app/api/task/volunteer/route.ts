import connectDB from '@/lib/db';
import taskService from '@/lib/services/taskService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/task/volunteer — Get tasks for volunteer
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone') || '';
  const tasks = await taskService.getTasksForVolunteer(phone);
  return sendResponse(200, true, 'Tasks fetched successfully', { tasks });
});
