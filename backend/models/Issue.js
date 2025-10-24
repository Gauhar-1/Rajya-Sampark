import { model, Schema } from "mongoose";

const issueSchema = new Schema({
    postId : { type: Schema.Types.ObjectId, ref: 'Post'},
    status : { type: String, enum:['idle','pending', 'approved', 'rejected', 'assigned', 'resolved'], default: 'idle'},
    takenBy : { type: Schema.Types.ObjectId, ref: 'Profile', require: true },
},{
    timestamps: true,
});

export default model('Issue', issueSchema);