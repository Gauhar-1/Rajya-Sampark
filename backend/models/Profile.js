import mongoose from "mongoose";

const profileschema = mongoose.Schema({
        uid: { type: String, unique: true},
        phone: String,
        role: { type: String, default: "VOTER"}, 
        name: String,
        photoURL: String, 
        regionId: String,
        status: { type: String, enum: ["active", "block"], default: "active"},
})

const Profile = mongoose.model("Profile",profileschema);

export default Profile;