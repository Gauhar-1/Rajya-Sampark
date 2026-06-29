import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  title: { type: String },
  description: String,
  type: { type: String, enum: ['Deadline', 'Key Event', 'Election Day'], required: true },
  date: { type: Date },
});

const Timeline = mongoose.models.Timeline || mongoose.model('Timeline', timelineSchema);

export default Timeline;
