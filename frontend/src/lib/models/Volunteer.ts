import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  fullName: String,
  phone: { type: String, unique: true },
  volunteerTarget: { type: String, enum: ['general', 'candidate'], required: true },
  specificCandidateName: String,
  interests: { type: [String] },
  availability: String,
  message: String,
  submittedAt: { type: Date },
  status: { type: String, enum: ['Active', 'Pending', 'Inactive'], default: 'Pending' },
  candidateId: { type: String, required: false },
});

const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
