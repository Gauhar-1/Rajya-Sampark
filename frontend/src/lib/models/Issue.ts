import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  status: { type: String, enum: ['idle', 'pending', 'approved', 'rejected', 'assigned', 'resolved'], default: 'idle' },
  takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
}, {
  timestamps: true,
});

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);

export default Issue;
