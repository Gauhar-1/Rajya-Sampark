import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  phone: String,
  role: { type: String, default: 'VOTER' },
  name: String,
  photoURL: String,
  regionId: String,
  status: { type: String, enum: ['active', 'block'], default: 'active' },
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;
