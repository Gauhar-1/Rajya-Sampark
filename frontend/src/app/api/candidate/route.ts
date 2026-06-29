import connectDB from '@/lib/db';
import candidateService from '@/lib/services/candidateService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// POST /api/candidate — Register a new candidate (Admin only)
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const body = await req.json();
  const newCandidate = await candidateService.registerCandidate(body);
  return sendResponse(201, true, `Profile for ${newCandidate.name} has been created.`, { newCandidate });
});

// GET /api/candidate — Get all candidates
export const GET = withErrorHandling(async () => {
  await requireAuth();
  await connectDB();
  const candidates = await candidateService.getAllCandidates();
  return sendResponse(200, true, 'Candidates fetched successfully', { candidates });
});
