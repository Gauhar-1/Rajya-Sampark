import  jwt  from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import Profile from '../models/Profile.js';
import { faker } from "@faker-js/faker";

dotenv.config();

export const sendOtp =async (req, res, next) => {
    const { phone }= req.body.data;
    const { latitude , longitude } = req.body.locationData;

    if (!phone) {
        res.status(400).json({ success: false, message: 'Phone number is required.'});
        return;
    }

    if(!latitude || !longitude){
        res.status(400).json({ success: false, message: 'Location coordinate is required.'});
        return;
    }

    try {
        // ✅ Check if user exists
        let user = await User.findOne({ phone });

        if (user?.status === "blocked") {
            res.status(403).json({ success: false, message: "Your account is blocked. Contact support." });
            return;
        }

        // ✅ Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const resendAvailableAt = new Date(Date.now() + 30 * 1000);

        // ✅ If user exists, update; otherwise, create a new user
        if (user) {
            user.otp = otp;
            user.status = "active";
            user.otpExpires = otpExpires;
            user.resendAvailableAt = resendAvailableAt;
            user.regionId = `${latitude}-${longitude}`
            await user.save();
        } else {
            await User.create({
                phone,
                otp,
                status: "active",
                otpExpires,
                resendAvailableAt,
                regionId : `${latitude}-${longitude}`
            });
        }

        // ✅ Send OTP via SMS API
        // const URL = `https://sms.renflair.in/V1.php?API=${process.env.API_KEY}&PHONE=${phone}&OTP=${otp}`;
        // await axios.get(URL);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            resendAfter: resendAvailableAt,
            otp : otp 
        });

    } catch (error) {
        console.error('❌ Error sending OTP:', error);
        next(error); // Pass the error to the global error handler
    }
};



export const verifyOtp  = (async (req, res, next) => {
    const { phone, otp } = req.body;
    try {

        const user = await User.findOne({ phone });

        if (!user) {
            return console.log('User not found' );
        }

        // @ts-ignore
        if (!user || user.otp !== otp || new Date() > user.otpExpires) {
             res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        let profile = await Profile.findOne({
            uid : user._id
        })

        if(!profile){
            const randomName = faker.person.firstName(); // Generates a random first name
        
             profile = await Profile.create({
              uid: user._id,
              name: randomName,
              phone,
              photoURL: "https://placehold.co/40x40.png?text=JD",
              regionId: "region 1"
            });

    }
    
        // JWT generation logic here
        const token = jwt.sign(
            { profile },
            process.env.JWT_SECRET , // Ensure JWT_SECRET is set in env
            { expiresIn: "7d" } // Token valid for 7 days
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Use only in HTTPS
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

        res.status(200).json({ 
            success: true,
            message: 'OTP verified successfully',
             token,
            profile
         });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        next(error)
        res.status(500).json({ error: 'Error verifying OTP' });
    }
});



export const logOut = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true, // Secure only in production
        sameSite: "none",
        expires: new Date(0),
        domain: ".taujiludo.in"
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
    res.status(200).json({ success: true, message: "Logged out successfully. All cookies cleared." });
};
