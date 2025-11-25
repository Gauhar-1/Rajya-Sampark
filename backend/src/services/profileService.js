import Profile from "../models/Profile.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const getProfiles = async () => {
    const profiles = await Profile.find();
    if (!profiles || profiles.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, 'Profiles not found');
    }
    return profiles;
};

const getProfile = async (profileId) => {
    const profile = await Profile.findById(profileId);
    if (!profile) {
        throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
    }
    return profile;
};

const updateUserRole = async (uid, newRole) => {
    const updatedUser = await Profile.findOneAndUpdate(
        { uid },
        { role: newRole },
        { new: true }
    );

    if (!updatedUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return updatedUser;
};

const updateUserStatus = async (uid, newStatus) => {
    const updatedUser = await Profile.findOneAndUpdate(
        { uid },
        { status: newStatus },
        { new: true }
    );

    if (!updatedUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return updatedUser;
};

export default {
    getProfiles,
    getProfile,
    updateUserRole,
    updateUserStatus
};
