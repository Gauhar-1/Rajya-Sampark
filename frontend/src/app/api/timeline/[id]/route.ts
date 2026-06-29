import connectDB from '@/lib/db';
import Timeline from '@/lib/models/Timeline';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// PUT /api/timeline/[id] — Update a timeline
export const PUT = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const { title, description, type, date } = await req.json();

  if (!id) {
    return sendResponse(404, false, 'Timeline Id not found');
  }

  const timeline = await Timeline.findByIdAndUpdate(
    id,
    { title, description, type, date },
    { new: true }
  );

  return sendResponse(200, true, 'Timeline updated successfully', { timeline });
});

// DELETE /api/timeline/[id] — Delete a timeline
export const DELETE = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;

  if (!id) {
    return sendResponse(404, false, 'Timeline Id not found');
  }

  await Timeline.findByIdAndDelete(id);
  return sendResponse(200, true, 'Timeline deleted successfully');
});
