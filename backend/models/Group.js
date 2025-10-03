import  { model, Schema } from "mongoose";

const schema = new Schema({
    name : String,
    description : String,
    createdBy : { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    members : [{
        userId : { type: Schema.Types.ObjectId, ref : 'User', required : true},
        roleInGroup : { type : String, enum:['admin', 'member'], default: 'member' },
        joinedAt : { type: Date, default: Date.now },
        lastReadTimestamp : Date,
    }]
},{
    timestamps : true
});

export default model('Group', schema);