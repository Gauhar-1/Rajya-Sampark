import connectDB from '@/lib/db';
import candidateService from '@/lib/services/candidateService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/candidate/[id]
export const GET = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const candidate = await candidateService.getCandidateById(id);
  return sendResponse(200, true, 'Candidate fetched successfully', { candidate });
});

// PUT /api/candidate/[id]
export const PUT = withErrorHandling(async (req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const body = await req.json();
  const updatedCandidate = await candidateService.updateCandidate(id, body);
  return sendResponse(200, true, 'Candidate updated successfully', { updatedCandidate });
});

// DELETE /api/candidate/[id]
export const DELETE = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  await candidateService.deleteCandidate(id);
  return sendResponse(200, true, 'Candidate has been removed');
});
