const pool = require('../db');

// GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, stock, image_url FROM products'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// GET /api/products/:id
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, description, price, stock, image_url FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;

  if (!name || !price || stock === undefined) {
    return res.status(400).json({ error: 'Name, price, and stock are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, stock, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           stock = $4,
           image_url = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, stock, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};