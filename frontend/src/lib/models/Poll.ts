import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  title: String,
  pollQuestion: String,
  pollOptions: { type: [mongoose.Schema.Types.Mixed] },
  totalVotes: Number,
  itemType: String,
  userHasVoted: { type: [mongoose.Schema.Types.Mixed] },
  timestamp: Date,
});

const Poll = mongoose.models.Poll || mongoose.model('Poll', pollSchema);

export default Poll;
