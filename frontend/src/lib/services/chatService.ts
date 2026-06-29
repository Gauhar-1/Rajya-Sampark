import Group from '@/lib/models/Group';
import Volunteer from '@/lib/models/Volunteer';
import Profile from '@/lib/models/Profile';
import { AppError } from '@/lib/api-utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

const createGroup = async (profile: any, groupData: Record<string, any>) => {
  const { name, description, volunterIds } = groupData;

  if (!name || !description) {
    throw new AppError(400, 'Missing fields');
  }

  if (!volunterIds || volunterIds.length === 0) {
    throw new AppError(400, 'At least one volunteer must be added');
  }

  const volunteers = await Volunteer.find({ _id: { $in: volunterIds } });

  if (volunteers.length !== volunterIds.length) {
    throw new AppError(404, 'One or more user IDs are invalid');
  }

  const members = volunterIds.map((id: string) => ({
    userId: id,
  }));

  members.push({
    userId: profile.uid,
    roleInGroup: 'admin',
  });

  const newGroup = new Group({
    name,
    description,
    createdBy: profile._id,
    members,
  });

  await newGroup.save();
  return newGroup;
};

const getGroups = async (profileId: string) => {
  const groups = await Group.find({ createdBy: profileId });
  if (!groups || groups.length === 0) {
    throw new AppError(404, "Didn't find groups");
  }
  return groups;
};

const getGroupsForVolunteer = async (phone: string) => {
  const volunteer = await Volunteer.findOne({ phone });
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found');
  }

  const groups = await Group.find({ 'members.userId': volunteer._id }).populate('createdBy');
  if (groups.length === 0) {
    throw new AppError(404, 'No group found');
  }

  return groups;
};

const chatService = {
  createGroup,
  getGroups,
  getGroupsForVolunteer,
};

export default chatService;
