import { Schema, model } from 'mongoose';

 export const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  name: String,
  category: String,
  price: Number,
  imageUrl: String,
});

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [cartItemSchema],
});

export default model('Cart', cartSchema);
