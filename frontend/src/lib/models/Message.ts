import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  content: { type: String, required: true, trim: true },
  contenType: { type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' },
}, {
  timestamps: true,
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
