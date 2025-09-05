import { Schema, model } from "mongoose"
import { type } from "os";

const schema = new Schema({
   profileId : String,
   content: String,
   mediaUrl : String || null,
   timestamp: Date,
   likes: Number,
   comments: Number,
   shares: Number,
});

export default model('Post', schema);
