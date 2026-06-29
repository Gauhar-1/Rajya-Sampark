import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  cid: String,
  title: String,
  volunteerName: String,
  volunteerId: String,
  status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
  assignedAt: String,
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
