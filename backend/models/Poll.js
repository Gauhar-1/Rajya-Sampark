import { model, Schema } from "mongoose"


const schema = new Schema({
    profileId : String,
    pollQuestion: String,
    pollOptions: { type: []},
    totalVotes: Number,
    itemType: String,
    timestamp: Date,
})

export default model('Poll', schema);