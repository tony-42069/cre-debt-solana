import { Router } from 'express';
import { getProperties, getProperty, createProperty, updateProperty } from '../../controllers/properties';

const router = Router();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', getProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 */
router.get('/:id', getProperty);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *               - value
 *               - owner
 *             properties:
 *               propertyId:
 *                 type: string
 *               value:
 *                 type: number
 *               owner:
 *                 type: string
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post('/', createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property
 *     tags: [Properties]
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
 *             properties:
 *               value:
 *                 type: number
 *               verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Property updated successfully
 */
router.put('/:id', updateProperty);

export default router;
