const express = require('express');
const router = express.Router();
const { 
    getUserOrders, 
    getOrderById, 
    getAllOrders,
    deleteOrder,
    updateOrderStatus
} = require('../controllers/ordersController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Endpoints for managing orders
 */

//USER or ADMIN
/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders for the authenticated user (admin sees all)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getUserOrders);


/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get a specific order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not your order)
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', authenticateToken, getOrderById);

//ADMIN ONLY

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order by ID (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order to delete
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Order not found
 */
router.delete('/:orderId', authenticateToken, authorizeRole('admin'), deleteOrder);

/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     summary: Update the status of an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: Order not found
 */
router.put('/:orderId', authenticateToken, authorizeRole('admin'), updateOrderStatus);

module.exports = router;
