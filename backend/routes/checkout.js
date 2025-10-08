const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require("../middleware/auth");
const pool = require("../db");

// Create a payment intent for the current user's cart
router.post("/create-payment-intent", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user's cart items and product prices
    const cartResult = await pool.query(
      `SELECT ci.id AS item_id, ci.quantity, p.id AS product_id, p.price, p.name
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    if (!cartResult.rows.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const cartItems = cartResult.rows;

    //  Calculate total amount in cents
    const amount = cartItems.reduce(
      (sum, item) =>
        sum + Math.round(parseFloat(item.price) * 100) * item.quantity,
      0
    );

    //  Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    // Save the order in the database (Pending status)
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, amount, "Pending"]
    );

    const orderId = orderResult.rows[0].id;

    // Save each item to the order_items table
    for (const item of cartItems) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Return client secret & order info to frontend
    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
    });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/mark-paid", authenticateToken, async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ error: "Missing orderId or paymentIntentId" });
    }

    // Verify the order belongs to the user
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order status to 'Paid'
    await pool.query(
      "UPDATE orders SET status = $1, payment_intent_id = $2 WHERE id = $3",
      ["Paid", paymentIntentId, orderId]
    );

    res.json({ message: "Order marked as Paid successfully" });
  } catch (err) {
    console.error("markPaid error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
