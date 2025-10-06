import { model, Schema } from 'mongoose';

const schema = new Schema({
    postId : { type: Schema.Types.ObjectId, ref: 'Post', require : true },
    profileId : { type: Schema.Types.ObjectId, ref: 'Profile', require: true },
    content : String,
    timestamp : Date
});

export default model('Comment', schema);