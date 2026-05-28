const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createOrder, getUserOrders, getOrderById, cancelOrder } = require('../controllers/ordersController');
const router = express.Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

module.exports = router;