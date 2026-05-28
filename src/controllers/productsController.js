const pool = require('../config/database');

const getAllProducts = async (req, res, next) => {
  try {
    const { category, min_price, max_price, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (min_price) {
      query += ` AND price >= $${paramIndex++}`;
      params.push(min_price);
    }
    
    if (max_price) {
      query += ` AND price <= $${paramIndex++}`;
      params.push(max_price);
    }
    
    query += ` ORDER BY id LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, category, price, stock_quantity, image_url } = req.body;
    
    const result = await pool.query(
      `INSERT INTO products (name, description, category, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, category, price, stock_quantity, image_url]
    );
    
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock_quantity, image_url } = req.body;
    
    const result = await pool.query(
      `UPDATE products SET name = $1, description = $2, category = $3, price = $4, stock_quantity = $5, image_url = $6
       WHERE id = $7 RETURNING *`,
      [name, description, category, price, stock_quantity, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };