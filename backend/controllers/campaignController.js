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
      return res.status(404).json({ message: "Volunteer not found" });
   }

   const campaigns = await Campaign.find({ vid : volunteer._id });

   res.status(200).json({ success: true, campaigns });

}

export const updateCampaign = async(req, res)=>{
   const { phone } = req.user;
   const { name, party, imageUrl, description, location, category } = req.body;

   const volunteer = await Volunteer.findOne({phone});

   if(!volunteer){
      return res.status(404).json({ message: "Volunteer not found"});
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

export const getAllCampaigns = async(req,  res)=>{
   const campaigns = await Campaign.find();

   res.status(200).json({ success: true, campaigns});
}

export const getCampaignById = async(req, res) =>{
   const { id } = req.params;

   if(!id){
    return  res.status(404).json({ message: "Campaign Id not found"});
   }

   const campaign = await Campaign.findById(id);
   if(!campaign){
      return res.status(500).json({ message: "Could not find campaign"});
   }

   res.status(200).json({ success: true, campaign });
}