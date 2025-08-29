"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPropertyStats = exports.deleteProperty = exports.updateProperty = exports.createProperty = exports.getProperty = exports.getProperties = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed.'));
        }
    }
});
const getProperties = async (req, res, next) => {
    try {
        const { walletAddress } = req.query;
        if (!walletAddress || typeof walletAddress !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }
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
        const properties = await prisma.property.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: properties,
            count: properties.length
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProperties = getProperties;
const getProperty = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProperty = getProperty;
exports.createProperty = [
    upload.fields([
        { name: 'valuationReport', maxCount: 1 },
        { name: 'propertyDeed', maxCount: 1 },
        { name: 'titleInsurance', maxCount: 1 },
        { name: 'survey', maxCount: 1 },
        { name: 'environmentalReport', maxCount: 1 },
        { name: 'additionalDocs', maxCount: 10 }
    ]),
    async (req, res, next) => {
        try {
            const { walletAddress, propertyType, address, city, state, zipCode, country, appraisedValue, valuationDate, valuationMethod, valuationProvider } = req.body;
            if (!walletAddress || !propertyType || !address || !city || !state || !zipCode) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields'
                });
            }
            const validPropertyTypes = ['OFFICE', 'RETAIL', 'INDUSTRIAL', 'MULTIFAMILY', 'HOSPITALITY', 'LAND', 'SPECIALTY'];
            if (!validPropertyTypes.includes(propertyType)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid property type'
                });
            }
            let user = await prisma.user.findUnique({
                where: { walletAddress }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        walletAddress,
                        entityType: 'INDIVIDUAL'
                    }
                });
            }
            const propertyId = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const files = req.files;
            const fileData = {};
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
                    ...(fileData.valuationReport && { valuationReport: fileData.valuationReport }),
                }
            });
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
        }
        catch (error) {
            next(error);
        }
    }
];
exports.updateProperty = [
    upload.fields([
        { name: 'valuationReport', maxCount: 1 },
        { name: 'propertyDeed', maxCount: 1 },
        { name: 'titleInsurance', maxCount: 1 },
        { name: 'survey', maxCount: 1 },
        { name: 'environmentalReport', maxCount: 1 },
        { name: 'additionalDocs', maxCount: 10 }
    ]),
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const existingProperty = await prisma.property.findUnique({
                where: { id }
            });
            if (!existingProperty) {
                return res.status(404).json({
                    success: false,
                    error: 'Property not found'
                });
            }
            const updateFields = {};
            if (updateData.propertyType)
                updateFields.propertyType = updateData.propertyType;
            if (updateData.address)
                updateFields.address = updateData.address;
            if (updateData.city)
                updateFields.city = updateData.city;
            if (updateData.state)
                updateFields.state = updateData.state;
            if (updateData.zipCode)
                updateFields.zipCode = updateData.zipCode;
            if (updateData.country)
                updateFields.country = updateData.country;
            if (updateData.appraisedValue)
                updateFields.appraisedValue = parseFloat(updateData.appraisedValue);
            if (updateData.valuationDate)
                updateFields.valuationDate = new Date(updateData.valuationDate);
            if (updateData.valuationMethod)
                updateFields.valuationMethod = updateData.valuationMethod;
            if (updateData.valuationProvider)
                updateFields.valuationProvider = updateData.valuationProvider;
            const files = req.files;
            if (files.valuationReport?.[0]) {
                updateFields.valuationReport = files.valuationReport[0].path;
            }
            const updatedProperty = await prisma.property.update({
                where: { id },
                data: updateFields
            });
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
        }
        catch (error) {
            next(error);
        }
    }
];
const deleteProperty = async (req, res, next) => {
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
        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                status: 'INACTIVE'
            }
        });
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
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProperty = deleteProperty;
const getPropertyStats = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPropertyStats = getPropertyStats;
//# sourceMappingURL=index.js.map