import Candidate from "../models/Candidate.js";
import User from "../models/User.js";

 export const registerCandidate = async (req, res) => {
  try {
    const { name, party, region, keyPolicies, manifestoUrl, imageUrl, profileBio } = req.body;

    const user = await User.findOne({ name });
    if(!user){
        return res.status(400).json({ msg: 'User not found' });
    }
    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({  uid : user._id });
    if (existingCandidate) {
      return res.status(400).json({ msg: 'Candidate already registered.' });
    }

    const newCandidate = new Candidate({
         uid : user._id,
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

    res.status(201).json({ success: true,  newCandidate, message:  `Profile for ${name} has been created.` });
  } catch (err) {
    console.error('Error registering candidate:', err);
    res.status(500).json({ msg: 'Server error during candidate registration' });
  }
};

export const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.status(200).json({ success: true,  candidates });
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ msg: 'Server error fetching candidates' });
  }
};

export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }

    res.status(200).json({ success: true,  candidate });
  } catch (err) {
    console.error('Error fetching candidate by ID:', err);
    res.status(500).json({ msg: 'Server error fetching candidate' });
  }
};

export const updateCandidate = async (req, res) => {
  const id  = req.params.id;
  try {
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ msg: 'Candidate not found for update' });
    }

    res.status(200).json({ success: true,  updatedCandidate });
  } catch (err) {
    console.error('Error updating candidate:', err.message);
    res.status(500).json({ msg: 'Server error updating candidate' });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const deletedCandidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!deletedCandidate) {
      return res.status(404).json({ msg: 'Candidate not found for deletion' });
    }

    res.status(200).json({ success: true, msg: `Candidate has been removed` });
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ msg: 'Server error deleting candidate' });
  }
};