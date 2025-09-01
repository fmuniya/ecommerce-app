const pool = require("../db"); // adjust if your db connection is elsewhere

// Create/get cart for user session
const getOrCreateCart = async (req) => {
  // Ensure user is authenticated
  if (!req.session.user) {
    throw new Error("Not authenticated");
  }

  // If no cart yet in session, create one
  if (!req.session.cartId) {
    const result = await pool.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
      [req.session.user.id]
    );
    req.session.cartId = result.rows[0].id;
  }

  return req.session.cartId;
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req);

    const result = await pool.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    res.json({ id: cartId, items: result.rows });
  } catch (err) {
    if (err.message === "Not authenticated") {
      return res.status(401).json({ error: err.message });
    }
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/cart/item
const addOrUpdateCartItem = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req);
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: "Product ID and quantity required" });
    }

    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + $3`,
      [cartId, product_id, quantity]
    );

    res.json({ message: "Item added to cart" });
  } catch (err) {
    if (err.message === "Not authenticated") {
      return res.status(401).json({ error: err.message });
    }
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/cart/item/:productId
const removeCartItem = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req);
    const { productId } = req.params;

    await pool.query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    if (err.message === "Not authenticated") {
      return res.status(401).json({ error: err.message });
    }
    console.error("Error removing item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCart,
  addOrUpdateCartItem,
  removeCartItem,
};
