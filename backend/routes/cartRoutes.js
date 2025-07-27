import { Router } from 'express';
const router = Router();
import { addCart, deleteCart, getCarts, updateCart } from '../controllers/cartController.js';

// Get user's cart
router.get('/', getCarts);

// Add item to cart
router.post('/', addCart);

// Update cart
router.put('/', updateCart);

// Delete cart
router.delete('/', deleteCart);

export default router;
