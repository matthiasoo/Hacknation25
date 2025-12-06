import express from 'express';
import { getMe, getVisitedLocations } from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Protect all routes

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and history
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', getMe);

/**
 * @swagger
 * /users/{id}/visited:
 *   get:
 *     summary: Get visited locations
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of visited locations
 */
router.get('/:id/visited', getVisitedLocations);

export default router;
