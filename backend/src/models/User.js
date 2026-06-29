import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    clerkId: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: false, unique: true, sparse: true },
    phone: { type: String, required: false, unique: true, sparse: true }, // Optional to allow email signups
    role: { type: String, enum: ["user", "admin", "volunteer"], default: "user" },
    otp: { type: String, required: false },
    status: { 
        type: String,
        enum: ["active", "blocked"], // Define allowed string values
        default: "active" 
    },
    otpExpires: { type: Date, required: false },
    resendAvailableAt: { type: Date, required: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
