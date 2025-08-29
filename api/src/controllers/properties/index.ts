import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed.'));
    }
  }
});

// Get all properties for a user
export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    // First, find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return res.json({
        success: true,
        data: [],
        message: 'No properties found for this wallet address'
      });
    }

    // Get user's properties
    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: properties,
      count: properties.length
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific property by ID
export const getProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Property ID is required'
      });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            walletAddress: true,
            entityType: true
          }
        }
      }
    });

    if (!property) {
      res.status(404).json({
        success: false,
        error: 'Property not found'
      });
      return;
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

// Create a new property registration
export const createProperty = [
  upload.fields([
    { name: 'valuationReport', maxCount: 1 },
    { name: 'propertyDeed', maxCount: 1 },
    { name: 'titleInsurance', maxCount: 1 },
    { name: 'survey', maxCount: 1 },
    { name: 'environmentalReport', maxCount: 1 },
    { name: 'additionalDocs', maxCount: 10 }
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        walletAddress,
        propertyType,
        address,
        city,
        state,
        zipCode,
        country,
        appraisedValue,
        valuationDate,
        valuationMethod,
        valuationProvider
      } = req.body;

      // Validate required fields
      if (!walletAddress || !propertyType || !address || !city || !state || !zipCode) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Validate property type
      const validPropertyTypes = ['OFFICE', 'RETAIL', 'INDUSTRIAL', 'MULTIFAMILY', 'HOSPITALITY', 'LAND', 'SPECIALTY'];
      if (!validPropertyTypes.includes(propertyType)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid property type'
        });
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress,
            entityType: 'INDIVIDUAL' // Default, can be updated later
          }
        });
      }

      // Generate unique property ID
      const propertyId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Prepare file paths
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const fileData: any = {};

      if (files.valuationReport?.[0]) {
        fileData.valuationReport = files.valuationReport[0].path;
      }
      if (files.propertyDeed?.[0]) {
        fileData.propertyDeed = files.propertyDeed[0].path;
      }
      if (files.titleInsurance?.[0]) {
        fileData.titleInsurance = files.titleInsurance[0].path;
      }
      if (files.survey?.[0]) {
        fileData.survey = files.survey[0].path;
      }
      if (files.environmentalReport?.[0]) {
        fileData.environmentalReport = files.environmentalReport[0].path;
      }
      if (files.additionalDocs?.length) {
        fileData.additionalDocs = files.additionalDocs.map(file => file.path);
      }

      // Create property record
      const property = await prisma.property.create({
        data: {
          propertyId,
          ownerId: user.id,
          propertyType,
          address,
          city,
          state,
          zipCode,
          country: country || 'US',
          appraisedValue: parseFloat(appraisedValue) || 0,
          valuationDate: valuationDate ? new Date(valuationDate) : new Date(),
          valuationMethod: valuationMethod || 'APPRAISAL',
          valuationProvider: valuationProvider || 'Unknown',
          status: 'DRAFT',
          verified: false,
          // Store file paths as JSON strings for now
          // In production, you'd want to use a proper file storage service
          ...(fileData.valuationReport && { valuationReport: fileData.valuationReport }),
        }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'PROPERTY_CREATED',
          entityType: 'Property',
          entityId: property.id || '',
          userId: user.id,
          walletAddress: user.walletAddress,
          newValues: {
            propertyId,
            propertyType,
            address,
            city,
            state,
            appraisedValue
          }
        }
      });

      res.status(201).json({
        success: true,
        data: property,
        message: 'Property registration submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// Update property information
export const updateProperty = [
  upload.fields([
    { name: 'valuationReport', maxCount: 1 },
    { name: 'propertyDeed', maxCount: 1 },
    { name: 'titleInsurance', maxCount: 1 },
    { name: 'survey', maxCount: 1 },
    { name: 'environmentalReport', maxCount: 1 },
    { name: 'additionalDocs', maxCount: 10 }
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get existing property
      const existingProperty = await prisma.property.findUnique({
        where: { id }
      });

      if (!existingProperty) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }

      // Prepare update data
      const updateFields: any = {};

      if (updateData.propertyType) updateFields.propertyType = updateData.propertyType;
      if (updateData.address) updateFields.address = updateData.address;
      if (updateData.city) updateFields.city = updateData.city;
      if (updateData.state) updateFields.state = updateData.state;
      if (updateData.zipCode) updateFields.zipCode = updateData.zipCode;
      if (updateData.country) updateFields.country = updateData.country;
      if (updateData.appraisedValue) updateFields.appraisedValue = parseFloat(updateData.appraisedValue);
      if (updateData.valuationDate) updateFields.valuationDate = new Date(updateData.valuationDate);
      if (updateData.valuationMethod) updateFields.valuationMethod = updateData.valuationMethod;
      if (updateData.valuationProvider) updateFields.valuationProvider = updateData.valuationProvider;

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.valuationReport?.[0]) {
        updateFields.valuationReport = files.valuationReport[0].path;
      }

      // Update property
      const updatedProperty = await prisma.property.update({
        where: { id },
        data: updateFields
      });

      // Log the update
      await prisma.auditLog.create({
        data: {
          action: 'PROPERTY_UPDATED',
          entityType: 'Property',
          entityId: id || '',
          oldValues: existingProperty,
          newValues: updateFields
        }
      });

      res.json({
        success: true,
        data: updatedProperty,
        message: 'Property updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// Delete a property (soft delete by marking as inactive)
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    // Instead of hard delete, mark as inactive
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'INACTIVE'
      }
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        action: 'PROPERTY_DELETED',
        entityType: 'Property',
        entityId: id,
        oldValues: property
      }
    });

    res.json({
      success: true,
      message: 'Property marked as inactive'
    });
  } catch (error) {
    next(error);
  }
};

// Get property statistics
export const getPropertyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return res.json({
        success: true,
        data: {
          totalProperties: 0,
          totalValue: 0,
          activeProperties: 0,
          pendingVerification: 0
        }
      });
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: user.id }
    });

    const stats = {
      totalProperties: properties.length,
      totalValue: properties.reduce((sum, prop) => sum + prop.appraisedValue, 0),
      activeProperties: properties.filter(p => p.status === 'ACTIVE').length,
      pendingVerification: properties.filter(p => p.status === 'DRAFT' || p.status === 'SUBMITTED').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
