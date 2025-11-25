import Campaign from "../models/Campaign.js";
import Volunteer from "../models/Volunteer.js";
import AppError from "../utils/AppError.js";
import httpStatus from "http-status";

const addCampaign = async (phone, campaignData) => {
    const { name, party, imageUrl, description, location, category } = campaignData;

    const volunteer = await Volunteer.findOne({ phone });
    if (!volunteer) {
        throw new AppError(httpStatus.NOT_FOUND, "Volunteer not found");
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
    return campaign;
};

const getCampaigns = async (phone) => {
    const volunteer = await Volunteer.findOne({ phone });
    if (!volunteer) {
        throw new AppError(httpStatus.NOT_FOUND, "Volunteer not found");
    }

    return await Campaign.find({ vid: volunteer._id });
};

const updateCampaign = async (phone, campaignData) => {
    const { name, party, imageUrl, description, location, category } = campaignData;

    const volunteer = await Volunteer.findOne({ phone });
    if (!volunteer) {
        throw new AppError(httpStatus.NOT_FOUND, "Volunteer not found");
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

const getCampaignById = async (id) => {
    if (!id) {
        throw new AppError(httpStatus.BAD_REQUEST, "Campaign Id not found");
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
        throw new AppError(httpStatus.NOT_FOUND, "Could not find campaign");
    }

    return campaign;
};

export default {
    addCampaign,
    getCampaigns,
    updateCampaign,
    getAllCampaigns,
    getCampaignById
};
