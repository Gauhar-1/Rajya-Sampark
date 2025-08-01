import Volunteer from "../models/Volunteer.js"
import Campaign from "../models/Campaign.js"

export const addCampaign = async(req, res)=>{
   const { phone } = req.user;
   const { name, party, imageUrl, description, location, category } = req.body;

   const volunteer = await Volunteer.findOne({phone});

   if(!volunteer){
    res.status(404).json({ message: "Volunteer not found" });
   }

   const campaign = new Campaign({
      vid: volunteer._id,
      name,
      party,
      imageUrl,
      description,
      location,
      popularityScore: 0,
      category
   });

   await campaign.save();

   res.status(200).json({ success: true, campaign});

}

export const getCampaigns = async(req, res)=>{
   const { phone } = req.user;
   
   const volunteer = await Volunteer.findOne({phone});

   if(!volunteer){
      res.status(404).json({ message: "Volunteer not found" });
   }

   const campaigns = await Campaign.find({ vid : volunteer._id });

   res.status(200).json({ success: true, campaigns });

}

export const updateCampaign = async(req, res)=>{
   const { phone } = req.user;
   const { name, party, imageUrl, description, location, category } = req.body;

   const volunteer = await Volunteer.findOne({phone});

   if(!volunteer){
      res.status(404).json({ message: "Volunteer not found"});
   }

   const campaign = await Campaign.findOneAndUpdate({ vid: volunteer._id },{
      name,
      party,
      imageUrl,
      description,
      location,
      category
   }, { new: true});

   res.status(200).json({ campaign, success: true });

}