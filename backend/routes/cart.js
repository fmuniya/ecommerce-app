const express = require("express");
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Helper function to get full cart with items
const getCartWithItems = async (userId) => {
  const cartResult = await pool.query("SELECT * FROM carts WHERE user_id=$1", [userId]);
  if (cartResult.rows.length === 0) return null;
  const cart = cartResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cart.id]
  );

  return { ...cart, items: itemsResult.rows };
};

/**
 * GET /api/cart - get or create user's cart
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    let cart = await getCartWithItems(req.user.id);
    if (!cart) {
      // create a new cart
      const newCartResult = await pool.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [req.user.id]
      );
      cart = await getCartWithItems(req.user.id);
    }
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/cart/items - add item to cart
 */
router.post("/items", authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "product_id and positive quantity required" });
  }

  try {
    let cart = await getCartWithItems(req.user.id);

    if (!cart) {
      // Create a new cart if user has none
      await pool.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [req.user.id]
      );
      cart = await getCartWithItems(req.user.id);
    }

    // Check if item exists
    const existingItem = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id=$1 AND product_id=$2",
      [cart.id, product_id]
    );

    if (existingItem.rows.length > 0) {
      // update quantity
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id=$2 AND product_id=$3",
        [quantity, cart.id, product_id]
      );
    } else {
      // insert new item
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
        [cart.id, product_id, quantity]
      );
    }

    // Return updated cart
    const updatedCart = await getCartWithItems(req.user.id);
    res.json(updatedCart);
  } catch (err) {
    console.error("Error adding to cart:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/cart/items/:itemId - update item quantity
 */
router.put("/items/:itemId", authenticateToken, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const item = await pool.query(
      `SELECT ci.* FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id=$1 AND c.user_id=$2`,
      [itemId, req.user.id]
    );

    if (item.rows.length === 0) return res.status(404).json({ error: "Item not found in your cart" });

    await pool.query("UPDATE cart_items SET quantity=$1 WHERE id=$2", [quantity, itemId]);

    const updatedCart = await getCartWithItems(req.user.id);
    res.json(updatedCart);
  } catch (err) {
    console.error("Error updating cart item:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/cart/items/:itemId - remove item from cart
 */
router.delete("/items/:itemId", authenticateToken, async (req, res) => {
  const { itemId } = req.params;

  try {
    const item = await pool.query(
      `SELECT ci.* FROM cart_items ci 
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id=$1 AND c.user_id=$2`,
      [itemId, req.user.id]
    );

    if (item.rows.length === 0) return res.status(404).json({ error: "Item not found in your cart" });

    await pool.query("DELETE FROM cart_items WHERE id=$1", [itemId]);

    const updatedCart = await getCartWithItems(req.user.id);
    res.json(updatedCart);
  } catch (err) {
    console.error("Error removing cart item:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
