import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  uid: { type: String, ref: 'Profile', unique: true },
  name: String,
  party: { type: String },
  region: String,
  imageUrl: String,
  keyPolicies: { type: [String] },
  profileBio: String,
  manifestoUrl: String,
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

export default Candidate;
