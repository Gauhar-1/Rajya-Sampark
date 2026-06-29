import connectDB from '@/lib/db';
import campaignService from '@/lib/services/campaignService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth';

// GET /api/campaign — Get all campaigns
export const GET = withErrorHandling(async () => {
  await requireAuth();
  await connectDB();
  const campaigns = await campaignService.getAllCampaigns();
  return sendResponse(200, true, 'All campaigns fetched successfully', { campaigns });
});

// POST /api/campaign — Add a campaign
export const POST = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const body = await req.json();
  const { phone, ...campaignData } = body;
  const campaign = await campaignService.addCampaign(phone, campaignData);
  return sendResponse(200, true, 'Campaign added successfully', { campaign });
});

// PUT /api/campaign — Update a campaign
export const PUT = withErrorHandling(async (req: Request) => {
  await requireAuth();
  await connectDB();
  const body = await req.json();
  const { phone, ...campaignData } = body;
  const campaign = await campaignService.updateCampaign(phone, campaignData);
  return sendResponse(200, true, 'Campaign updated successfully', { campaign });
});
