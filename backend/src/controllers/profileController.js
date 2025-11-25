import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import profileService from '../services/profileService.js';

export const getProfiles = catchAsync(async (req, res) => {
  const profiles = await profileService.getProfiles();
  sendResponse(res, httpStatus.OK, true, 'Profiles fetched successfully', { profiles });
});

export const getProfile = catchAsync(async (req, res) => {
  const { _id } = req.user.profile;
  const profile = await profileService.getProfile(_id);
  sendResponse(res, httpStatus.OK, true, 'Profile fetched successfully', { profile });
});

export const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newRole } = req.body;
  const user = await profileService.updateUserRole(id, newRole);
  sendResponse(res, httpStatus.OK, true, 'User role updated', { user });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  const user = await profileService.updateUserStatus(id, newStatus);
  sendResponse(res, httpStatus.OK, true, 'User status updated', { user });
});
