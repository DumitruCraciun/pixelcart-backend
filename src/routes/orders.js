// src/routes/orders.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createOrder, getUserOrders, getOrderById, cancelOrder } = require('../controllers/ordersController');
const router = express.Router();

router.use(authenticate);

// Rutele corecte
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/my-orders', getUserOrders);  // ← Adaugă asta pentru frontend
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;