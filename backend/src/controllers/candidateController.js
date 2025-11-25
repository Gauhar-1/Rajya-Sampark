import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import candidateService from '../services/candidateService.js';

export const registerCandidate = catchAsync(async (req, res) => {
  const newCandidate = await candidateService.registerCandidate(req.body);
  sendResponse(res, httpStatus.CREATED, true, `Profile for ${newCandidate.name} has been created.`, { newCandidate });
});

export const getAllCandidates = catchAsync(async (req, res) => {
  const candidates = await candidateService.getAllCandidates();
  sendResponse(res, httpStatus.OK, true, 'Candidates fetched successfully', { candidates });
});

export const getCandidateById = catchAsync(async (req, res) => {
  const candidate = await candidateService.getCandidateById(req.params.id);
  sendResponse(res, httpStatus.OK, true, 'Candidate fetched successfully', { candidate });
});

export const updateCandidate = catchAsync(async (req, res) => {
  const updatedCandidate = await candidateService.updateCandidate(req.params.id, req.body);
  sendResponse(res, httpStatus.OK, true, 'Candidate updated successfully', { updatedCandidate });
});

export const deleteCandidate = catchAsync(async (req, res) => {
  await candidateService.deleteCandidate(req.params.id);
  sendResponse(res, httpStatus.OK, true, 'Candidate has been removed');
});