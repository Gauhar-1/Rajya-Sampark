import { Schema, model } from "mongoose"

const schema = new Schema({
   profileId : String,
   content: String,
   mediaUrl : String || null,
   timestamp: Date,
   itemType: String,
   likes: Number,
   comments: Number,
   shares: Number,
});

export default model('Post', schema);
