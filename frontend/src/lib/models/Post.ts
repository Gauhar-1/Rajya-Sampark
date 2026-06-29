import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  title: String,
  content: String,
  mediaUrl: String,
  timestamp: Date,
  itemType: String,
  likedBy: [mongoose.Schema.Types.Mixed],
  likes: Number,
  comments: Number,
  shares: Number,
  isIssue: Boolean,
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
