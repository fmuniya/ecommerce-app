const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    logoutUser,
 } = require('../controllers/usersController');


const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { register, login, googleLogin, getCurrentUser } = require('../controllers/authController');

//console.log({ authenticateToken, authorizeRole, getAllUsers });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints for managing users and authentication
 */


//Admin only - get all users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticateToken, authorizeRole('admin'), getAllUsers);

//Admin or user

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin or self)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: User object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

//get user by ID
router.get('/:id', authenticateToken, getUserById);
// Update user
// router.put('/:id', authenticateToken, updateUser);


/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID (admin or self)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put('/:id', authenticateToken, updateUser);


/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */
router.post("/register", register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in a user and get a JWT token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Unauthorized
 */
router.post('/login', login);

// ------------------ Google login ------------------
/**
 * @swagger
 * /users/google-login:
 *   post:
 *     summary: Log in or register a user via Google OAuth (JWT from Google Identity Services)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token (JWT) returned from Google Identity Services
 *     responses:
 *       200:
 *         description: Successful login or registration
 *       401:
 *         description: Invalid Google token
 */
//router.post('/google-login', googleLogin);

// Google login (POST)
router.post('/auth/google', googleLogin);

// get logged-in user
router.get("/me", authenticateToken, getCurrentUser);

// Logout

router.post('/logout', logoutUser);







module.exports = router;
