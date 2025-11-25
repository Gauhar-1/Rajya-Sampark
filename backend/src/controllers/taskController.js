import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import taskService from '../services/taskService.js';

export const getTasks = catchAsync(async (req, res) => {
  const { uid } = req.user;
  const tasks = await taskService.getTasks(uid);
  sendResponse(res, httpStatus.OK, true, 'Tasks fetched successfully', { tasks });
});

export const getTasksForVolunteer = catchAsync(async (req, res) => {
  const { phone } = req.user;
  const tasks = await taskService.getTasksForVolunteer(phone);
  sendResponse(res, httpStatus.OK, true, 'Tasks fetched successfully', { tasks });
});

export const addTask = catchAsync(async (req, res) => {
  const { uid } = req.user;
  const task = await taskService.addTask(uid, req.body);
  sendResponse(res, httpStatus.CREATED, true, 'Task is added', { task });
});

export const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;
  const task = await taskService.updateStatus(id, newStatus);
  sendResponse(res, httpStatus.OK, true, 'Task status updated successfully', { task });
});
