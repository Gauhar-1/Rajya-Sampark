import { model, Schema } from "mongoose";

const timelineSchema = new Schema({
   title: { type: String },
   description: String,
   type: { type: String, enum: ['Deadline' , 'Key Event' , 'Election Day'], required: true },
   date: { type: Date }
});

export default model( 'Timeline' , timelineSchema);