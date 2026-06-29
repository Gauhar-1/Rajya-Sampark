import Volunteer from '@/lib/models/Volunteer';
import Candidate from '@/lib/models/Candidate';
import Profile from '@/lib/models/Profile';
import { AppError } from '@/lib/api-utils';

const createVolunteer = async (volunteerData: Record<string, unknown>) => {
  const { fullName, phone, volunteerTarget, specificCandidateName, interests, availability, message } = volunteerData;

  let candidateId = null;

  if (specificCandidateName) {
    const candidate = await Candidate.findOne({ name: specificCandidateName });
    if (!candidate) {
      throw new AppError(404, 'Candidate not found');
    }
    candidateId = candidate._id;
  }

  const newVolunteer = new Volunteer({
    fullName,
    phone,
    volunteerTarget,
    specificCandidateName: specificCandidateName ?? null,
    interests,
    availability,
    message,
    candidateId: !specificCandidateName ? null : candidateId,
  });

  await newVolunteer.save();
  return newVolunteer;
};

const getAllVolunteers = async (uid: string) => {
  if (!uid) {
    throw new AppError(400, 'User ID missing');
  }

  const candidate = await Candidate.findOne({ uid });
  if (!candidate) {
    throw new AppError(404, 'Candidate not found');
  }

  const volunteers = await Volunteer.find({ candidateId: candidate._id });
  return volunteers;
};

const updateVolunteerStatus = async (id: string, status: string) => {
  const updated = await Volunteer.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!updated) {
    throw new AppError(404, 'Volunteer not found');
  }

  const profile = await Profile.findOneAndUpdate(
    { phone: updated.phone },
    { role: 'VOLUNTEER' },
    { new: true }
  );

  if (!profile) {
    throw new AppError(500, 'Phone Number Invalid');
  }

  return updated;
};

const volunteerService = {
  createVolunteer,
  getAllVolunteers,
  updateVolunteerStatus,
};

export default volunteerService;
