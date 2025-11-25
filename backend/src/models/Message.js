import { model, Schema } from "mongoose";

const schema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    senderId: { type : Schema.Types.ObjectId, ref: 'Profile', required: true },
    content: { type: String, required: true, trim: true },
    contenType: { type: String, enum: ['text', 'image', 'file', 'system' ], default: 'text'},
},{
    timestamps: true,
});

export default model('Message', schema);