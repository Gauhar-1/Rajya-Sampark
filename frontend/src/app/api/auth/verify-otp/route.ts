import connectDB from '@/lib/db';
import authService from '@/lib/services/authService';
import { sendResponse, withErrorHandling } from '@/lib/api-utils';

export const POST = withErrorHandling(async (req: Request) => {
  await connectDB();
  const body = await req.json();
  const { phone, otp } = body;

  if (!phone || !otp) {
    return sendResponse(400, false, 'Phone and OTP are required');
  }

  const { token, profile } = await authService.verifyOtp(phone, otp);
  return sendResponse(200, true, 'OTP verified successfully', { token, profile });
});
