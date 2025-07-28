import { Schema, model } from "mongoose"

const volunteerSchema = new Schema({
    fullName: String,
    phone: { type: String, unique: true },
    volunteerTarget:{ type:String,  enum: ["general", "candidate"], required: true },
    specificCandidateName: String,
    interests: {type: [String]},
    availability: String,
    message: String,
    submittedAt: { type: Date},
    status:{ type:String,  enum: ["Active", "Pending", "Inactive"], default: "Pending" },
    candidateId: { type: String, unique: true , required: false },
})

export default model('Volunteer', volunteerSchema);