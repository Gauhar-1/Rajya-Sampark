import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: String,
  category: String,
  price: String,
  imageUrl: String,
  stock: String,
  dataAiHint: String,
  description: String,
});

export default model('Product', productSchema);
