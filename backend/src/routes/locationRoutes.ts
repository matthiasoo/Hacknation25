import express from 'express';
import {
    getAllLocations,
    getLocation,
    createLocation,
    getNearestUnvisited,
    getLocationTimeline,
    addTimelineEvent,
    getCategories,
} from '../controllers/locationController';
import { protect } from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const router = express.Router();

const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
            const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
            if (currentUser) {
                req.user = { id: currentUser.id };
            }
        } catch (err) {
            // Token invalid or expired, proceed as guest
        }
    }
    next();
};

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Managing locations and check-ins
 */

/**
 * @swagger
 * /locations/categories:
 *   get:
 *     summary: Get all location categories
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', getCategories);

router.post('/', protect, createLocation); // Admin/Seed only really

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations (optional category filter)
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [MEMORIAL, BUILDING, MUSEUM, PARK, OTHER]
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get('/', getAllLocations);

/**
 * @swagger
 * /locations/nearest-unvisited:
 *   get:
 *     summary: Get nearest unvisited location
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Suggestion
 */
router.get('/nearest-unvisited', protect, getNearestUnvisited);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get location details (and check-in if auth)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location details with new discovery flag
 */
router.get('/:id', isLoggedIn, getLocation);

/**
 * @swagger
 * /locations/{id}/timeline:
 *   get:
 *     summary: Get location timeline
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timeline events
 */
router.get('/:id/timeline', getLocationTimeline);

/**
 * @swagger
 * /locations/{id}/timeline:
 *   post:
 *     summary: Add timeline event
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [year, description]
 *             properties:
 *               year: 
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/:id/timeline', protect, addTimelineEvent);

export default router;
