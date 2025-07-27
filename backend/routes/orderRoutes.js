import { addOrder, getOrderById, getOrders, updatePaymentStatus, updateShippingStatus } from '../controllers/orderController.js';
import { Router } from 'express';
const router = Router();

// Get all orders
router.get('/', getOrders);

// Add a new order
router.post('/', addOrder);

// Update shipping status of an order
router.put('/shipping-status', updateShippingStatus);

// Update payment status of an order
router.put('/payment-status', updatePaymentStatus);

// Get order by ID
router.get('/order-history', getOrderById);

export default router;

