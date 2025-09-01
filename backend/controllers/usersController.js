const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// GET /api/users - Admin only
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/users/:id - Admin or user accessing own data
const getUserById = async (req, res) => {
  const { id } = req.params;

  // Check permissions: allow if admin or if requesting own user data
  if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// PUT /api/users/:id - Admin or user updating own info
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  // Permission check
  if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    let hashedPassword;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (email) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }
    if (hashedPassword) {
      fields.push(`password_hash = $${idx++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated', user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Failed to logout" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
};

module.exports = { 
    getAllUsers, 
    getUserById,
    updateUser,
    logoutUser
};