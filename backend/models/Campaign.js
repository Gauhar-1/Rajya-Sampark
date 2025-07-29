import { Schema, model } from 'mongoose';

const campaignSchema = new Schema({
  id: String,
  name: String,
  party: String,
  imageUrl: String,
  description: String,
  location: String,
  popularityScore: Number,
  category: {type: String, enum:['Local' , 'State' , 'National'], required: true},
  }, {
    timestamps: true, 
  }
);

export default model('Campaign', campaignSchema);
