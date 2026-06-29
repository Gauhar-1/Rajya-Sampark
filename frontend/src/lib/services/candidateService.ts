import Candidate from '@/lib/models/Candidate';
import User from '@/lib/models/User';
import { AppError } from '@/lib/api-utils';

const registerCandidate = async (candidateData: Record<string, unknown>) => {
  const { name, phone, party, region, keyPolicies, manifestoUrl, imageUrl, profileBio } = candidateData;

  if (!phone) {
    throw new AppError(400, 'Phone number is required');
  }

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  } else {
    const existingCandidate = await Candidate.findOne({ uid: user._id });
    if (existingCandidate) {
      throw new AppError(400, 'Candidate already registered.');
    }
  }

  const newCandidate = new Candidate({
    uid: user._id,
    name,
    party,
    region,
    keyPolicies,
    manifestoUrl,
    imageUrl,
    profileBio,
    dataAiHint: 'person portrait',
  });

  await newCandidate.save();
  return newCandidate;
};

const getAllCandidates = async () => {
  return await Candidate.find();
};

const getCandidateById = async (id: string) => {
  const candidate = await Candidate.findById(id);
  if (!candidate) {
    throw new AppError(404, 'Candidate not found');
  }
  return candidate;
};

const updateCandidate = async (id: string, updateData: Record<string, unknown>) => {
  const updatedCandidate = await Candidate.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedCandidate) {
    throw new AppError(404, 'Candidate not found for update');
  }

  return updatedCandidate;
};

const deleteCandidate = async (id: string) => {
  const deletedCandidate = await Candidate.findByIdAndDelete(id);
  if (!deletedCandidate) {
    throw new AppError(404, 'Candidate not found for deletion');
  }
  return deletedCandidate;
};

const candidateService = {
  registerCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
};

export default candidateService;
