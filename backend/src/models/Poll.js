import mongoose, { model, Schema } from "mongoose"


const schema = new Schema({
    profileId : { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', require: true },
    pollQuestion: String,
    pollOptions: { type: []},
    totalVotes: Number,
    itemType: String,
    userHasVoted: { type: []},
    timestamp: Date,
})

export default model('Poll', schema);