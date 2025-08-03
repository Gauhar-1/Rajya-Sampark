import Volunteer from "../models/Volunteer.js";
import Candidate from "../models/Candidate.js";
import Profile from "../models/Profile.js";

export const createVolunteer = async (req, res) => {
  try {
    const { fullName, phone, volunteerTarget, specificCandidateName, interests, availability, message } = req.body;

    let candidateId = null;

    if (specificCandidateName) {
      const candidate = await Candidate.findOne({ name:  specificCandidateName });
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
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
    res.status(201).json({success: true});
  } catch (err) {
    res.status(500).json({ error: 'Error creating volunteer', details: err.message });
  }
};

export const getAllVolunteers = async (req, res) => {

    const { uid } = req.user;

    if(!uid){
      return  console.log("UserId missing", uid);
    }

  try {

    const candidate = await Candidate.findOne({uid});
    if(!candidate){
        return res.status(401).json({ message: "Candidate not found"});
    }

    const volunteers = await Volunteer.find({ candidateId : candidate._id});

    res.status(200).json({ success: true , volunteers });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching volunteers', details: err.message });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;


    const updated = await Volunteer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    const profile =  await Profile.findOneAndUpdate({ phone : updated.phone }, {
      role : "VOLUNTEER"
    });

    if(!profile){
     return res.status(500).json({ message : "Phone Number Invalid" });
    }

     return res.status(200).json({ success: true ,updated});
  } catch (err) {
    res.status(500).json({ error: 'Error updating volunteer status', details: err.message });
  }
};