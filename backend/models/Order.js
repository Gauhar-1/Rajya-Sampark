import { Schema, model } from 'mongoose';
import { cartItemSchema } from './Cart.js';

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    customer: String,
    phone: String,
  
    total: Number, 
    status: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered','Cancelled'],
      default: 'Processing',
    },
  
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded', 'Failed'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'upi'],
    },
  
    shippingAddress: {
    fullName: String,
    addressLine1: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
   upiReferenceNumber : String,
   paymentScreenshotUri : String,
  
    items: [cartItemSchema],
  }, {
    timestamps: true, 
  }
);

export default model('Order', orderSchema);
