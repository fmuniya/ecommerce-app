const pool = require('../db');

// POST /api/cart
// Create a new cart for the user or return existing active cart
const createOrGetCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Check if user already has a cart
    const existingCart = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);

    if (existingCart.rows.length > 0) {
      return res.status(200).json(existingCart.rows[0]);
    }

    // Create a new cart
    const result = await pool.query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
      [userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createOrGetCart error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/cart/:cartId
// Add or update product quantity in the cart
const addOrUpdateCartItem = async (req, res) => {
  const { cartId } = req.params;
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'product_id and quantity (>=1) are required' });
  }

  try {
    // Check if cart exists and belongs to the user
    const cartResult = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (cartResult.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Not your cart' });
    }

    // Check if the item already exists in the cart
    const existingItem = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const updated = await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
        [quantity, existingItem.rows[0].id]
      );
      return res.status(200).json(updated.rows[0]);
    } else {
      // Insert new item
      const inserted = await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [cartId, product_id, quantity]
      );
      return res.status(201).json(inserted.rows[0]);
    }
  } catch (err) {
    console.error('addOrUpdateCartItem error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/cart/:cartId
// Get all items in a cart with product details
const getCartContents = async (req, res) => {
  const { cartId } = req.params;

  try {
    // Check if cart exists and belongs to user
    const cartResult = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (cartResult.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Not your cart' });
    }

    // Get cart items with product details
    const itemsResult = await pool.query(`
      SELECT ci.id as cart_item_id, ci.quantity, p.id as product_id, p.name, p.description, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    res.json({ cart: cartResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error('getCartContents error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Checkout cart
const checkoutCart = async (req, res) => {
  const { cartId } = req.params;
  const userId = req.user.userId;

  try {
    // Check that cart exists and belongs to the user
    const cartResult = await pool.query(
      'SELECT * FROM carts WHERE id = $1 AND user_id = $2',
      [cartId, userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cart not found or does not belong to the user' });
    }

    // Get cart items
    const itemsResult = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);

    if (itemsResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Simulate payment processing (always succeeds)
    const paymentSuccess = true;

    if (!paymentSuccess) {
      return res.status(402).json({ error: 'Payment failed' });
    }

    // ✅ Calculate total amount
    let totalAmount = 0;
    for (const item of itemsResult.rows) {
      const productRes = await pool.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
      const productPrice = productRes.rows[0].price;
      totalAmount += productPrice * item.quantity;
    }

    // ✅ Create order with total_amount
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_amount, status, created_at)
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [userId, totalAmount, 'paid']
    );

    const orderId = orderResult.rows[0].id;

    // ✅ Create order_items based on cart_items
    for (const item of itemsResult.rows) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))`,
        [orderId, item.product_id, item.quantity]
      );
    }

    // ✅ Clear cart
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    res.status(201).json({
      message: 'Checkout successful, order created',
      orderId,
      totalAmount
    });

  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  createOrGetCart,
  addOrUpdateCartItem,
  getCartContents,
  checkoutCart
};
