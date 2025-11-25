import Candidate from "../models/Candidate.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const registerCandidate = async (candidateData) => {
    const { name, phone, party, region, keyPolicies, manifestoUrl, imageUrl, profileBio } = candidateData;

    if (!phone) {
        throw new AppError(httpStatus.BAD_REQUEST, "Phone number is required");
    }

    let user = await User.findOne({ phone });
    if (!user) {
        user = await User.create({ phone });
    } else {
        const existingCandidate = await Candidate.findOne({ uid: user._id });
        if (existingCandidate) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Candidate already registered.');
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

const getCandidateById = async (id) => {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
        throw new AppError(httpStatus.NOT_FOUND, 'Candidate not found');
    }
    return candidate;
};

const updateCandidate = async (id, updateData) => {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
        throw new AppError(httpStatus.NOT_FOUND, 'Candidate not found for update');
    }

    return updatedCandidate;
};

const deleteCandidate = async (id) => {
    const deletedCandidate = await Candidate.findByIdAndDelete(id);
    if (!deletedCandidate) {
        throw new AppError(httpStatus.NOT_FOUND, 'Candidate not found for deletion');
    }
    return deletedCandidate;
};

export default {
    registerCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate
};
