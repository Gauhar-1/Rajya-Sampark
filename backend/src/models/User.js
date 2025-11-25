import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  phone: { type: String, required: true, unique: true },
    otp: { type: String, required: false },
    status: {     type: String,
        enum: ["active", "blocked"], // Define allowed string values
        default: "active" },
    otpExpires: { type: Date, required: false },
    resendAvailableAt: { type: Date, required: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
