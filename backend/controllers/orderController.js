import Order from '../models/Order.js';

export const getOrders =async (req, res) => {
  const orders = await Order.find();
  res.status(201).json(orders);
};

export const addOrder=  async (req, res) => {
  try {
    const {
      userId,
      prices,
      cartItems,
      data
    } = req.body;

    
    if(data.paymentMethod === 'upi'){
      if (!data.upiReferenceNumber || !data.paymentScreenshotUri) {
        return res.status(400).json({ success: false, message: 'UPI reference number and payment screenshot are required for UPI payments' });
      }
    }

    const newOrder = await Order.create({
      userId,
      customer: data.fullName,
      phone: data.phone,
      total : prices,
      paymentMethod : data.paymentMethod,
       upiReferenceNumber  : data.paymentMethod === 'upi' ? data.upiReferenceNumber : '',
    paymentScreenshotUri : data.paymentMethod === 'upi' ? data.paymentScreenshotUri : '',
      shippingAddress: {
    fullName : data.fullName,
    addressLine1 : data.addressLine1,
    city : data.city,
    state : data.state,
    zipCode : data.zipCode,
    country : data.country,
  },
      items : cartItems,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

export const updateShippingStatus = async (req, res) => {
  const { orderId } = req.query;
  const { status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Shipping status updated successfully',
      order: updatedOrder,
    });
  }
  catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update shipping status', error: error.message });
  }
} 

export const updatePaymentStatus = async (req, res) => {
  const { orderId } = req.query;
  const { isApproved }  = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

   if (typeof isApproved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isApproved must be a boolean' });
  }

  const paymentStatus = isApproved ? 'Paid' : 'Failed';

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update payment status', error: error.message });
  }
}

export const getOrderById = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const orders = await Order.find({ userId });

    if (!orders) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
}