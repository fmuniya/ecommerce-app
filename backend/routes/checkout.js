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

    // Calculate total amount in cents
    const amount = cartResult.rows.reduce(
      (sum, item) => sum + Math.round(parseFloat(item.price) * 100) * item.quantity,
      0
    );

    // Create a Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true }, // enable card payments automatically
      metadata: { userId }, // attach user info
    });

    // Return client secret to frontend
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
