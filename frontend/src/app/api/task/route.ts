import connectDB from '@/lib/db';
import taskService from '@/lib/services/taskService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/task — Get all tasks for a candidate
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid') || '';
  const tasks = await taskService.getTasks(uid);
  return sendResponse(200, true, 'Tasks fetched successfully', { tasks });
});

// POST /api/task — Add a new task
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const body = await req.json();
  const { uid, ...taskData } = body;
  const task = await taskService.addTask(uid, taskData);
  return sendResponse(201, true, 'Task is added', { task });
});
