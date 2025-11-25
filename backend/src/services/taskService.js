import Task from '../models/Task.js';
import Candidate from '../models/Candidate.js';
import Volunteer from '../models/Volunteer.js';
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const getTasks = async (uid) => {
    const candidate = await Candidate.findOne({ uid });
    if (!candidate) {
        throw new AppError(httpStatus.NOT_FOUND, "Candidate not found");
    }

    return await Task.find({ cid: candidate._id });
};

const getTasksForVolunteer = async (phone) => {
    const volunteer = await Volunteer.findOne({ phone });
    if (!volunteer) {
        throw new AppError(httpStatus.NOT_FOUND, "Volunteer not found");
    }

    return await Task.find({ volunteerId: volunteer._id });
};

const addTask = async (uid, taskData) => {
    const { title, volunteerId, volunteerName, assignedAt } = taskData;

    const candidate = await Candidate.findOne({ uid });
    if (!candidate) {
        throw new AppError(httpStatus.NOT_FOUND, "Candidate not found");
    }

    const task = new Task({
        cid: candidate._id,
        title,
        volunteerId,
        volunteerName,
        assignedAt
    });

    await task.save();
    return task;
};

const updateStatus = async (id, newStatus) => {
    const task = await Task.findByIdAndUpdate(
        id,
        { status: newStatus },
        { new: true }
    );

    if (!task) {
        throw new AppError(httpStatus.NOT_FOUND, "Task not found");
    }

    return task;
};

export default {
    getTasks,
    getTasksForVolunteer,
    addTask,
    updateStatus
};
