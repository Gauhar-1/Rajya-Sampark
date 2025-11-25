import Volunteer from "../models/Volunteer.js";
import Candidate from "../models/Candidate.js";
import Profile from "../models/Profile.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const createVolunteer = async (volunteerData) => {
    const { fullName, phone, volunteerTarget, specificCandidateName, interests, availability, message } = volunteerData;

    let candidateId = null;

    if (specificCandidateName) {
        const candidate = await Candidate.findOne({ name: specificCandidateName });
        if (!candidate) {
            throw new AppError(httpStatus.NOT_FOUND, 'Candidate not found');
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
        candidateId: !specificCandidateName ? null : candidateId
    });

    await newVolunteer.save();
    return newVolunteer;
};

const getAllVolunteers = async (uid) => {
    if (!uid) {
        throw new AppError(httpStatus.BAD_REQUEST, "User ID missing");
    }

    const candidate = await Candidate.findOne({ uid });
    if (!candidate) {
        throw new AppError(httpStatus.NOT_FOUND, "Candidate not found");
    }

    const volunteers = await Volunteer.find({ candidateId: candidate._id });
    return volunteers;
};

const updateVolunteerStatus = async (id, status) => {
    const updated = await Volunteer.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!updated) {
        throw new AppError(httpStatus.NOT_FOUND, 'Volunteer not found');
    }

    const profile = await Profile.findOneAndUpdate(
        { phone: updated.phone },
        { role: "VOLUNTEER" },
        { new: true }
    );

    if (!profile) {
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Phone Number Invalid");
    }

    return updated;
};

export default {
    createVolunteer,
    getAllVolunteers,
    updateVolunteerStatus
};
