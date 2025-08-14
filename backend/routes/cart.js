const express = require('express');
const router = express.Router();

const {
  createOrGetCart,
  addOrUpdateCartItem,
  getCartContents,
  checkoutCart
} = require('../controllers/cartController');

const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

// Create or get user's cart
/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Create or get the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Existing cart returned
 *       201:
 *         description: New cart created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createOrGetCart);

// Add or update item in cart
/**
 * @swagger
 * /cart/{cartId}:
 *   post:
 *     summary: Add or update an item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item updated in cart
 *       201:
 *         description: Item added to cart
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not your cart)
 *       404:
 *         description: Cart not found
 */
router.post('/:cartId', authenticateToken, addOrUpdateCartItem);

// Get all items in a cart
/**
 * @swagger
 * /cart/{cartId}:
 *   get:
 *     summary: Get all items in a cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the cart
 *     responses:
 *       200:
 *         description: List of cart items
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not your cart)
 *       404:
 *         description: Cart not found
 */
router.get('/:cartId', authenticateToken, getCartContents);

//cart checkout
/**
 * @swagger
 * /cart/{cartId}/checkout:
 *   post:
 *     summary: Checkout the cart and create an order
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the cart
 *     responses:
 *       201:
 *         description: Checkout successful and order created
 *       400:
 *         description: Cart is empty
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not your cart)
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
router.post('/:cartId/checkout', authenticateToken, checkoutCart);

module.exports = router;
