import jwt from 'jsonwebtoken';
import { faker } from "@faker-js/faker";
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import AppError from '../utils/AppError.js';
import httpStatus from 'http-status';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (phone, latitude, longitude) => {
    let user = await User.findOne({ phone });

    if (user?.status === "blocked") {
        throw new AppError(httpStatus.FORBIDDEN, "Your account is blocked. Contact support.");
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const resendAvailableAt = new Date(Date.now() + 30 * 1000);
    const regionId = `${latitude}-${longitude}`;

    if (user) {
        user.otp = otp;
        user.status = "active";
        user.otpExpires = otpExpires;
        user.resendAvailableAt = resendAvailableAt;
        user.regionId = regionId;
        await user.save();
    } else {
        user = await User.create({
            phone,
            otp,
            status: "active",
            otpExpires,
            resendAvailableAt,
            regionId
        });
    }

    // TODO: Integrate SMS API here

    return {
        otp, // For development/testing
        resendAfter: resendAvailableAt
    };
};

const verifyOtp = async (phone, otp) => {
    const user = await User.findOne({ phone });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (user.otp !== otp || new Date() > user.otpExpires) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
    }

    let profile = await Profile.findOne({ uid: user._id });

    if (!profile) {
        const randomName = faker.person.firstName();
        profile = await Profile.create({
            uid: user._id,
            name: randomName,
            phone,
            photoURL: "https://placehold.co/40x40.png?text=JD",
            regionId: "region 1" // Should probably come from user.regionId or logic
        });
    }

    const token = jwt.sign(
        { profile },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return { token, profile };
};

export default {
    sendOtp,
    verifyOtp
};
