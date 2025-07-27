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
    const { profile } = req.user;
  try {
    const profile = await Profile.findById(profile._id)
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

