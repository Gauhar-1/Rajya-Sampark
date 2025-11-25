import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import chatService from '../services/chatService.js';

export const createGroup = catchAsync(async (req, res) => {
    const profile = req.user;
    const newGroup = await chatService.createGroup(profile, req.body);
    sendResponse(res, httpStatus.OK, true, 'Group created successfully', { newGroup });
});

export const getGroups = catchAsync(async (req, res) => {
    const profile = req.user;
    const groups = await chatService.getGroups(profile._id);
    sendResponse(res, httpStatus.OK, true, 'Groups fetched successfully', { groups });
});

export const getGroupsForVolunter = catchAsync(async (req, res) => {
    const profile = req.user;
    const groups = await chatService.getGroupsForVolunteer(profile.phone);
    sendResponse(res, httpStatus.OK, true, 'Groups fetched successfully', { groups });
});