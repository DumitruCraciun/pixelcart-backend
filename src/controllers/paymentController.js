// src/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/database');

// Creează o sesiune de checkout Stripe
const createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Construiește line_items pentru Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Stripe lucrează în pence
      },
      quantity: item.quantity,
    }));

    // Adaugă discount de 20% dacă totalul e > 50 (demo)
    let discount = 0;
    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    if (total > 50) {
      discount = 20;
    }

    // Creează sesiunea Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/cart`,
      customer_email: req.user.email,
      metadata: {
        user_id: userId,
        discount_applied: discount,
      },
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

// Webhook pentru confirmarea plății (Stripe apelează această rută)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verifică semnătura webhook-ului
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Dacă nu avem webhook secret, folosește body-ul direct (doar pentru test)
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesează evenimentul
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, discount_applied } = session.metadata;
    const items = session.display_items || [];

    try {
      // Calculează totalul din sesiune
      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

      // 1. Creează comanda în baza de date
      const orderResult = await pool.query(
        `INSERT INTO orders (user_id, total_amount, status, discount_applied)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [parseInt(user_id), totalAmount, 'paid', parseFloat(discount_applied) || 0]
      );

      const orderId = orderResult.rows[0].id;

      // 2. Salvează produsele din comandă (order_items)
      // Extrage produsele din line_items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      for (const item of lineItems.data) {
        // Caută produsul după nume în baza de date
        const product = await pool.query(
          'SELECT id, price FROM products WHERE name = $1 LIMIT 1',
          [item.description]
        );

        if (product.rows.length > 0) {
          await pool.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
             VALUES ($1, $2, $3, $4)`,
            [orderId, product.rows[0].id, item.quantity, parseFloat(item.price.unit_amount) / 100]
          );
        } else {
          // Dacă nu găsește produsul, salvează cu product_id = 0 sau NULL (dar avem NOT NULL)          
          console.warn('Product not found:', item.description);
        }
      }

      // 3. Golește coșul utilizatorului
      await pool.query('DELETE FROM cart_items WHERE user_id = $1', [parseInt(user_id)]);

      console.log(`✅ Order ${orderId} created for user ${user_id}`);
    } catch (error) {
      console.error('Error creating order from webhook:', error);
    }
  }

  res.json({ received: true });
};

// Verifică statusul unei comenzi după session_id (pentru pagina de succes)
const verifyOrder = async (req, res, next) => {
  try {
    const { session_id } = req.query;
    const userId = req.user.id;

    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    // Verifică dacă există o comandă pentru acest user
    const result = await pool.query(
      `SELECT id, total_amount, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  verifyOrder,
};