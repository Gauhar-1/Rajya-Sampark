import { addProduct, deleteProduct, getProductById, getProducts, updateProduct } from '../controllers/productController.js';
import { Router } from 'express';
const router = Router();

// Get all products
router.get('/', getProducts);

// Add a new product
router.post('/', addProduct);

// Update Product
router.put('/',updateProduct);

// Delete Product
router.delete('/',deleteProduct);

// get product by id
 router.get('/byId', getProductById)

export default router;