const pool = require('../config/database');

const createOrder = async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { discount_applied = 0 } = req.body;
    
    await client.query('BEGIN');
    
    // Ia produsele din cart
    const cartItems = await client.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    
    if (cartItems.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    
    let total = 0;
    for (const item of cartItems.rows) {
      total += item.price * item.quantity;
    }
    
    const finalTotal = total * (1 - discount_applied / 100);
    
    // Creează comanda
    const order = await client.query(
      `INSERT INTO orders (user_id, total_amount, discount_applied, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [userId, finalTotal, discount_applied]
    );
    
    // Adaugă produsele în order_items
    for (const item of cartItems.rows) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.rows[0].id, item.product_id, item.quantity, item.price]
      );
    }
    
    // Golește cart-ul
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const orders = await pool.query(
      `SELECT o.*, 
        (SELECT json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'unit_price', oi.unit_price))
         FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, orders: orders.rows });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const order = await pool.query(
      `SELECT o.* FROM orders o
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, userId]
    );
    
    if (order.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const items = await pool.query(
      `SELECT oi.*, p.name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );
    
    res.json({
      success: true,
      order: order.rows[0],
      items: items.rows
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE orders SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled' });
    }
    
    res.json({ success: true, message: 'Order cancelled', order: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// La sfârșitul fișierului ordersController.js
module.exports = { 
  createOrder, 
  getUserOrders, 
  getMyOrders: getUserOrders,  // Alias pentru frontend
  getOrderById, 
  cancelOrder 
};