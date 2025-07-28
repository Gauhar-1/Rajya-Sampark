import Task from '../models/Task.js';
import Candidate from '../models/Candidate.js';
import Volunteer from '../models/Volunteer.js';

// Get all tasks for a candidate
 export const getTasks = async (req, res) => {
  const { uid } = req.user;

  const candidate = await Candidate.findOne({uid});

  if(!candidate){
    return res.status(401).json({ message: "Candidate not found"});
  }

  const tasks = await Task.find({cid: candidate._id});
  
  res.status(200).json({ success: true ,tasks });
};

// Get all tasks for a volunteer
 export const getTasksForVolunteer = async (req, res) => {
  const { phone } = req.user;

  const volunteer = await Volunteer.findOne({phone});

  if(!volunteer){
    return res.status(401).json({ message: "Candidate not found"});
  }

  const tasks = await Task.find({volunteerId: volunteer._id});
  
  res.status(200).json({ success: true ,tasks });
};

// Add a new task
export const addTask = async (req, res) => {

  const { title, volunteerId, volunteerName, assignedAt } = req.body;
  const { uid } = req.user;

  const candidate = await Candidate.findOne({uid});

  if(!candidate){
    return res.status(401).json({ message: "Candidate not found"});
  }

  const task = new Task({
    cid: candidate._id,
    title,
    volunteerId,
    volunteerName,
    assignedAt
  });

  await task.save();

  res.status(201).json({
    task,
    success: true,
    message: "Task is added"
  });
};

export const updateStatus = async (req, res)=>{
   const  status  = req.body.newStatus;
   const { id } = req.params;

   const task = await Task.findByIdAndUpdate(id,{
    status
   });

   if(!task){
    res.status(404).json({ message:"Task not found" });
   }

   res.status(200).json({ success: true, task});
}
