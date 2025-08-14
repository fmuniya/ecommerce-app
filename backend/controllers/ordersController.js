const pool = require('../db');


// GET /api/orders/admin - Admin: Get all orders from all users
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.user_id, o.status, o.created_at, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('getAllOrders error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/orders - Get all orders for the authenticated user
const getUserOrders = async (req, res) => {
  const userId = req.user.userId;

  try {
    const ordersResult = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json(ordersResult.rows);
  } catch (err) {
    console.error('getUserOrders error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/orders/:orderId - Get a specific order and its items
const getOrderById = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    // Get the order
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Check access: only owner or admin can view
    if (order.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this order' });
    }

    // Get order items
    const itemsResult = await pool.query(`
      SELECT oi.product_id, p.name, oi.quantity, oi.price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({ order, items: itemsResult.rows });
  } catch (err) {
    console.error('getOrderById error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// PUT /api/orders/:orderId - UPDATE ORDER STATUS ADMIN ONLY
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('updateOrderStatus error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// DELETE /api/orders/:orderId - ADMIN ONLY
const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Check if the order exists
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete related order items first
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);

    // Then delete the order itself
    await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('deleteOrder error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
};
