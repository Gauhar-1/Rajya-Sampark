import connectDB from '@/lib/db';
import volunteerService from '@/lib/services/volunteerService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// POST /api/volunteer — Create a new volunteer
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const body = await req.json();
  await volunteerService.createVolunteer(body);
  return sendResponse(201, true, 'Volunteer created successfully');
});

// GET /api/volunteer — Get all volunteers of a candidate
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid') || '';
  const volunteers = await volunteerService.getAllVolunteers(uid);
  return sendResponse(200, true, 'Volunteers fetched successfully', { volunteers });
});
