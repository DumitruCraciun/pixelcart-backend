// backend/src/controllers/authController.js

const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    
    // Verifică dacă userul există deja
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash parolă
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Salvează user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, hashedPassword, full_name, 'customer']
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generează JWT - FIX AICI
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // ← Am înlocuit cu '7d' în loc de process.env.JWT_EXPIRES_IN
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };