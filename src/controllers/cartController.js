// backend/src/controllers/cartController.js

const pool = require('../config/database');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.added_at,
              p.id as product_id, p.name, p.price, p.image_url, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [userId]
    );
    
    const total = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      items: result.rows,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;
    
    // Verifică dacă produsul există și are stoc
    const product = await pool.query('SELECT id, stock_quantity FROM products WHERE id = $1', [product_id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Verifică sau inserează în cart
    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );
    
    if (existing.rows.length > 0) {
      const newQuantity = existing.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existing.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, product_id, quantity]
      );
    }
    
    res.json({ success: true, message: 'Product added to cart' });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      // Șterge dacă quantity e 0
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3',
        [quantity, userId, productId]
      );
    }
    
    res.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    
    await pool.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    res.json({ success: true, message: 'Product removed from cart' });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };