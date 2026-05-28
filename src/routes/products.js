const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productsController');
const router = express.Router();

// Publice
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;