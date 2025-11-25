import Group from "../models/Group.js";
import Volunteer from "../models/Volunteer.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const createGroup = async (profile, groupData) => {
    const { name, description, volunterIds } = groupData;

    if (!name || !description) {
        throw new AppError(httpStatus.BAD_REQUEST, "Missing fields");
    }

    if (!volunterIds || volunterIds.length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "At least one volunteer must be added");
    }

    const volunteers = await Volunteer.find({ _id: { $in: volunterIds } });

    if (volunteers.length !== volunterIds.length) {
        throw new AppError(httpStatus.NOT_FOUND, "One or more user IDs are invalid");
    }

    const members = volunterIds.map(id => ({
        userId: id,
    }));

    members.push({
        userId: profile.uid,
        roleInGroup: 'admin'
    });

    const newGroup = new Group({
        name,
        description,
        createdBy: profile._id,
        members
    });

    await newGroup.save();
    return newGroup;
};

const getGroups = async (profileId) => {
    const groups = await Group.find({ createdBy: profileId });
    if (!groups || groups.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, "Didn't find groups");
    }
    return groups;
};

const getGroupsForVolunteer = async (phone) => {
    const volunteer = await Volunteer.findOne({ phone });
    if (!volunteer) {
        throw new AppError(httpStatus.NOT_FOUND, "Volunteer not found");
    }

    const groups = await Group.find({ 'members.userId': volunteer._id }).populate('createdBy');
    if (groups.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, "No group found");
    }

    return groups;
};

export default {
    createGroup,
    getGroups,
    getGroupsForVolunteer
};
