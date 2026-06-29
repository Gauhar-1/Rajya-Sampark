import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roleInGroup: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    lastReadTimestamp: Date,
  }],
}, {
  timestamps: true,
});

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);

export default Group;
