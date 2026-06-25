// src/routes/payment.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { createCheckoutSession, handleWebhook, verifyOrder } = require('../controllers/paymentController');

const router = express.Router();

// Rute protejate
router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.get('/verify-order', authenticate, verifyOrder);

module.exports = router;
// Exportă și handleWebhook separat pentru server.js
module.exports.handleWebhook = handleWebhook;