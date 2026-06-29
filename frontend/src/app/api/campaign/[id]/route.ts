import connectDB from '@/lib/db';
import campaignService from '@/lib/services/campaignService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/campaign/[id]
export const GET = withErrorHandling(async (_req: Request, context) => {
  await requireAuth();
  await connectDB();
  const { id } = await context!.params;
  const campaign = await campaignService.getCampaignById(id);
  return sendResponse(200, true, 'Campaign fetched successfully', { campaign });
});
