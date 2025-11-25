import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import campaignService from '../services/campaignService.js';

export const addCampaign = catchAsync(async (req, res) => {
   const { phone } = req.user;
   const campaign = await campaignService.addCampaign(phone, req.body);
   sendResponse(res, httpStatus.OK, true, 'Campaign added successfully', { campaign });
});

export const getCampaigns = catchAsync(async (req, res) => {
   const { phone } = req.user;
   const campaigns = await campaignService.getCampaigns(phone);
   sendResponse(res, httpStatus.OK, true, 'Campaigns fetched successfully', { campaigns });
});

export const updateCampaign = catchAsync(async (req, res) => {
   const { phone } = req.user;
   const campaign = await campaignService.updateCampaign(phone, req.body);
   sendResponse(res, httpStatus.OK, true, 'Campaign updated successfully', { campaign });
});

export const getAllCampaigns = catchAsync(async (req, res) => {
   const campaigns = await campaignService.getAllCampaigns();
   sendResponse(res, httpStatus.OK, true, 'All campaigns fetched successfully', { campaigns });
});

export const getCampaignById = catchAsync(async (req, res) => {
   const { id } = req.params;
   const campaign = await campaignService.getCampaignById(id);
   sendResponse(res, httpStatus.OK, true, 'Campaign fetched successfully', { campaign });
});