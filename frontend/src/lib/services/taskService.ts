import Task from '@/lib/models/Task';
import Candidate from '@/lib/models/Candidate';
import Volunteer from '@/lib/models/Volunteer';
import { AppError } from '@/lib/api-utils';

const getTasks = async (uid: string) => {
  const candidate = await Candidate.findOne({ uid });
  if (!candidate) {
    throw new AppError(404, 'Candidate not found');
  }

  return await Task.find({ cid: candidate._id });
};

const getTasksForVolunteer = async (phone: string) => {
  const volunteer = await Volunteer.findOne({ phone });
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found');
  }

  return await Task.find({ volunteerId: volunteer._id });
};

const addTask = async (uid: string, taskData: Record<string, unknown>) => {
  const { title, volunteerId, volunteerName, assignedAt } = taskData;

  const candidate = await Candidate.findOne({ uid });
  if (!candidate) {
    throw new AppError(404, 'Candidate not found');
  }

  const task = new Task({
    cid: candidate._id,
    title,
    volunteerId,
    volunteerName,
    assignedAt,
  });

  await task.save();
  return task;
};

const updateStatus = async (id: string, newStatus: string) => {
  const task = await Task.findByIdAndUpdate(
    id,
    { status: newStatus },
    { new: true }
  );

  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  return task;
};

const taskService = {
  getTasks,
  getTasksForVolunteer,
  addTask,
  updateStatus,
};

export default taskService;
