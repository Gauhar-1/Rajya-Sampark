import connectDB from '@/lib/db';
import Timeline from '@/lib/models/Timeline';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/timeline — Get all timelines
export const GET = withErrorHandling(async () => {
  await requireAuth();
  await connectDB();
  const timelines = await Timeline.find();
  return sendResponse(200, true, 'Timelines fetched successfully', { timelines });
});

// POST /api/timeline — Create a timeline
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { title, description, type, date } = await req.json();
  const timeline = new Timeline({ title, description, type, date });
  await timeline.save();
  return sendResponse(200, true, 'Timeline created successfully', { timeline });
});
