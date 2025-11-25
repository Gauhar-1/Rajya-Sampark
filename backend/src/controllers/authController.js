import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import authService from '../services/authService.js';

export const sendOtp = catchAsync(async (req, res) => {
    const { phone } = req.body.data || {};
    const { latitude, longitude } = req.body.locationData || {};

    if (!phone) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Phone number is required.');
    }

    if (!latitude || !longitude) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Location coordinate is required.');
    }

    const result = await authService.sendOtp(phone, latitude, longitude);

    sendResponse(res, httpStatus.OK, true, 'OTP sent successfully', result);
});

export const verifyOtp = catchAsync(async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Phone and OTP are required');
    }

    const { token, profile } = await authService.verifyOtp(phone, otp);

    res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Use only in HTTPS
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, httpStatus.OK, true, 'OTP verified successfully', { token, profile });
});

export const logOut = catchAsync(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        domain: ".taujiludo.in" // This domain seems specific, keeping it for now but should be env var
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        domain: ".taujiludo.in"
    });

    res.clearCookie("sessionId", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(0),
        domain: ".taujiludo.in"
    });

    res.setHeader("Cache-Control", "no-store");
    sendResponse(res, httpStatus.OK, true, "Logged out successfully. All cookies cleared.");
});
