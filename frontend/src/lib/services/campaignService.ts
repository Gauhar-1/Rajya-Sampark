import Campaign from '@/lib/models/Campaign';
import Volunteer from '@/lib/models/Volunteer';
import { AppError } from '@/lib/api-utils';

const addCampaign = async (phone: string, campaignData: Record<string, unknown>) => {
  const { name, party, imageUrl, description, location, category } = campaignData;

  const volunteer = await Volunteer.findOne({ phone });
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found');
  }

  const campaign = new Campaign({
    vid: volunteer._id,
    name,
    party,
    imageUrl,
    description,
    location,
    popularityScore: 0,
    category,
  });

  await campaign.save();
  return campaign;
};

const getCampaigns = async (phone: string) => {
  const volunteer = await Volunteer.findOne({ phone });
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found');
  }

  return await Campaign.find({ vid: volunteer._id });
};

const updateCampaign = async (phone: string, campaignData: Record<string, unknown>) => {
  const { name, party, imageUrl, description, location, category } = campaignData;

  const volunteer = await Volunteer.findOne({ phone });
  if (!volunteer) {
    throw new AppError(404, 'Volunteer not found');
  }

  const campaign = await Campaign.findOneAndUpdate(
    { vid: volunteer._id },
    { name, party, imageUrl, description, location, category },
    { new: true }
  );

  return campaign;
};

const getAllCampaigns = async () => {
  return await Campaign.find();
};

const getCampaignById = async (id: string) => {
  if (!id) {
    throw new AppError(400, 'Campaign Id not found');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw new AppError(404, 'Could not find campaign');
  }

  return campaign;
};

const campaignService = {
  addCampaign,
  getCampaigns,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
};

export default campaignService;
