import Profile from '@/lib/models/Profile';
import { AppError } from '@/lib/api-utils';

const getProfiles = async () => {
  const profiles = await Profile.find();
  if (!profiles || profiles.length === 0) {
    throw new AppError(404, 'Profiles not found');
  }
  return profiles;
};

const getProfile = async (profileId: string) => {
  const profile = await Profile.findById(profileId);
  if (!profile) {
    throw new AppError(404, 'Profile not found');
  }
  return profile;
};

const updateUserRole = async (uid: string, newRole: string) => {
  const updatedUser = await Profile.findOneAndUpdate(
    { uid },
    { role: newRole },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError(404, 'User not found');
  }

  return updatedUser;
};

const updateUserStatus = async (uid: string, newStatus: string) => {
  const updatedUser = await Profile.findOneAndUpdate(
    { uid },
    { status: newStatus },
    { new: true }
  );

  if (!updatedUser) {
    throw new AppError(404, 'User not found');
  }

  return updatedUser;
};

const profileService = {
  getProfiles,
  getProfile,
  updateUserRole,
  updateUserStatus,
};

export default profileService;
