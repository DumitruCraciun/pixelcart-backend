// backend/src/routes/cart.js

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const router = express.Router();

router.use(authenticate); // Toate rutele de cart necesită autentificare

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;