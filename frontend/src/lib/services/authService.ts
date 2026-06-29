import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import Profile from '@/lib/models/Profile';
import { AppError } from '@/lib/api-utils';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (phone: string, latitude: number, longitude: number) => {
  let user = await User.findOne({ phone });

  if (user?.status === 'blocked') {
    throw new AppError(403, 'Your account is blocked. Contact support.');
  }

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  const resendAvailableAt = new Date(Date.now() + 30 * 1000);
  const regionId = `${latitude}-${longitude}`;

  if (user) {
    user.otp = otp;
    user.status = 'active';
    user.otpExpires = otpExpires;
    user.resendAvailableAt = resendAvailableAt;
    user.regionId = regionId;
    await user.save();
  } else {
    user = await User.create({
      phone,
      otp,
      status: 'active',
      otpExpires,
      resendAvailableAt,
      regionId,
    });
  }

  return {
    otp, // For development/testing
    resendAfter: resendAvailableAt,
  };
};

const verifyOtp = async (phone: string, otp: string) => {
  const user = await User.findOne({ phone });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (user.otp !== otp || new Date() > user.otpExpires) {
    throw new AppError(400, 'Invalid or expired OTP');
  }

  let profile = await Profile.findOne({ uid: user._id });

  if (!profile) {
    profile = await Profile.create({
      uid: user._id,
      name: 'New User',
      phone,
      photoURL: 'https://placehold.co/40x40.png?text=JD',
      regionId: 'region 1',
    });
  }

  const token = jwt.sign(
    { profile },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return { token, profile };
};

const authService = {
  sendOtp,
  verifyOtp,
};

export default authService;
