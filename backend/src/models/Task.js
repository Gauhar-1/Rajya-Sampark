import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
    cid: String,
    title: String,
    volunteerName: String,
    volunteerId: String,
    status:{ type: String, enum:['To Do' , 'In Progress' , 'Completed'], default: 'To Do'},
    assignedAt: String,
});

export default model('Task', taskSchema);
