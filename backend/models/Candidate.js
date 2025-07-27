import { Schema, model } from "mongoose"

const candidateSchema = new Schema({
    uid: { type: String, unique: true},
    name: String,
    party: {type: String, unique: true},
    region: String,
    imageUrl: String,
    keyPolicies: {type: [String]},
    profileBio: String,
    manifestoUrl: String,
})

export default model('Candidate', candidateSchema);