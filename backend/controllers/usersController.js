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




// Post /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
    //validate inputs
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    
    // Check if the user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists with that email' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword] // NOTE: Replace with hashed password in production
    );

    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already in use' });
    } else {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = { 
    getAllUsers, 
    getUserById,
    registerUser,
    loginUser,
    updateUser
};