import Profile from "../models/Profile.js"

export const getProfiles = async (req, res, next) => {
  try {
    const profiles = await Profile.find()
    if (!profiles) {
      return res.status(404).json({ msg: 'Profiles not found' });
    }
    res.status(200).json({ success: true, profiles });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
    const { _id } = req.user.profile;
  try {
    const profile = await Profile.findById(_id)
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const  role  = req.body.newRole;

  try {
    const updatedUser = await Profile.findOneAndUpdate({uid: id}, { role: role }, { new: true });
    res.status(200).json({ success: true, message: "User role updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating user role", error: err });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus } = req.body;

  try {
     console.log("Status", newStatus)
    const updatedUser = await Profile.findOneAndUpdate({uid: id}, { status: newStatus }, { new: true });
    res.status(200).json({ success: true ,message: "User status updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating user status", error: err });
  }
};

