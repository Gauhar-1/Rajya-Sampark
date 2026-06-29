import connectDB from '@/lib/db';
import authService from '@/lib/services/authService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';

export const POST = withErrorHandling(async (req: Request) => {
  await connectDB();
  const body = await req.json();
  const { phone } = body.data || {};
  const { latitude, longitude } = body.locationData || {};

  if (!phone) {
    return sendResponse(400, false, 'Phone number is required.');
  }
  if (!latitude || !longitude) {
    return sendResponse(400, false, 'Location coordinate is required.');
  }

  const result = await authService.sendOtp(phone, latitude, longitude);
  return sendResponse(200, true, 'OTP sent successfully', result);
});
