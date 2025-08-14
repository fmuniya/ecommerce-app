const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');


const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and retrieval
 */

// Public access
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve a list of products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

// Authorised access

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Product object to create
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.post('/', authenticateToken, authorizeRole('admin'), createProduct);


/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product ID to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       description: Product data to update
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Product not found
 */
router.put('/:id', authenticateToken, authorizeRole('admin'), updateProduct);


/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Product ID to delete
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteProduct);


module.exports = router;
