import mongoose, { Schema, model } from "mongoose"

const schema = new Schema({
   profileId : { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', require: true},
   content: String,
   mediaUrl : String || null,
   timestamp: Date,
   itemType: String,
   likes: Number,
   comments: Number,
   shares: Number,
});

export default model('Post', schema);
