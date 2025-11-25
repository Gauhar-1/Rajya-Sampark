import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import volunteerService from '../services/volunteerService.js';

export const createVolunteer = catchAsync(async (req, res) => {
  await volunteerService.createVolunteer(req.body);
  sendResponse(res, httpStatus.CREATED, true, 'Volunteer created successfully');
});

export const getAllVolunteers = catchAsync(async (req, res) => {
  const { uid } = req.user;
  const volunteers = await volunteerService.getAllVolunteers(uid);
  sendResponse(res, httpStatus.OK, true, 'Volunteers fetched successfully', { volunteers });
});

export const updateVolunteerStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await volunteerService.updateVolunteerStatus(id, status);
  sendResponse(res, httpStatus.OK, true, 'Volunteer status updated successfully', { updated });
});