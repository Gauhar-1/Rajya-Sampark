import connectDB from '@/lib/db';
import campaignService from '@/lib/services/campaignService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/campaign/volunteer — Get campaigns for a volunteer
export const GET = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone') || '';
  const campaigns = await campaignService.getCampaigns(phone);
  return sendResponse(200, true, 'Campaigns fetched successfully', { campaigns });
});
