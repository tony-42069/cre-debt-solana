import { Router } from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats
} from '../../controllers/properties/index';

const router = Router();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties for a wallet address
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana wallet address
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', getProperties);

/**
 * @swagger
 * /api/properties/stats:
 *   get:
 *     summary: Get property statistics for a wallet
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana wallet address
 *     responses:
 *       200:
 *         description: Property statistics
 */
router.get('/stats', getPropertyStats);

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
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get('/:id', getProperty);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property registration
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - propertyType
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Solana wallet address
 *               propertyType:
 *                 type: string
 *                 enum: [OFFICE, RETAIL, INDUSTRIAL, MULTIFAMILY, HOSPITALITY, LAND, SPECIALTY]
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               appraisedValue:
 *                 type: number
 *               valuationDate:
 *                 type: string
 *                 format: date
 *               valuationMethod:
 *                 type: string
 *               valuationProvider:
 *                 type: string
 *               valuationReport:
 *                 type: string
 *                 format: binary
 *               propertyDeed:
 *                 type: string
 *                 format: binary
 *               titleInsurance:
 *                 type: string
 *                 format: binary
 *               survey:
 *                 type: string
 *                 format: binary
 *               environmentalReport:
 *                 type: string
 *                 format: binary
 *               additionalDocs:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/', createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update property information
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               propertyType:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               appraisedValue:
 *                 type: number
 *               valuationDate:
 *                 type: string
 *                 format: date
 *               valuationMethod:
 *                 type: string
 *               valuationProvider:
 *                 type: string
 *               valuationReport:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 */
router.put('/:id', updateProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete property (soft delete)
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property marked as inactive
 *       404:
 *         description: Property not found
 */
router.delete('/:id', deleteProperty);

export default router;
