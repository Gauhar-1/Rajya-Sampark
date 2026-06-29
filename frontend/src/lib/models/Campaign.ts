import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  vid: String,
  name: String,
  party: String,
  imageUrl: String,
  description: String,
  location: String,
  popularityScore: Number,
  category: { type: String, enum: ['Local', 'State', 'National'], required: true },
}, {
  timestamps: true,
});

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

export default Campaign;
