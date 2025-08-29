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

// Get all loan applications for a user
export const getLoanApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
      return;
    }

    // Find user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      res.json({
        success: true,
        data: [],
        message: 'No loan applications found for this wallet address'
      });
      return;
    }

    // Get user's loan applications
    const applications = await prisma.loanApplication.findMany({
      where: { borrowerId: user.id },
      include: {
        property: {
          select: {
            id: true,
            propertyId: true,
            address: true,
            city: true,
            state: true,
            appraisedValue: true
          }
        },
        loan: {
          select: {
            id: true,
            status: true,
            fundedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific loan application by ID
export const getLoanApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
      return;
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        borrower: {
          select: {
            id: true,
            walletAddress: true,
            entityType: true
          }
        },
        property: true,
        loan: {
          include: {
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Loan application not found'
      });
      return;
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// Create a new loan application
export const createLoanApplication = [
  upload.fields([
    { name: 'financialStatements', maxCount: 5 },
    { name: 'taxReturns', maxCount: 3 },
    { name: 'bankStatements', maxCount: 5 },
    { name: 'additionalDocs', maxCount: 10 }
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        walletAddress,
        propertyId,
        requestedAmount,
        termMonths,
        interestRate,
        loanPurpose,
        annualIncome,
        monthlyDebt,
        employmentStatus,
        creditScore
      } = req.body;

      // Validate required fields
      if (!walletAddress || !propertyId || !requestedAmount || !termMonths) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
        return;
      }

      // Find or create user
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

      // Verify property ownership
      const property = await prisma.property.findFirst({
        where: {
          id: propertyId,
          ownerId: user.id
        }
      });

      if (!property) {
        res.status(404).json({
          success: false,
          error: 'Property not found or not owned by this user'
        });
        return;
      }

      // Calculate LTV ratio
      const requestedAmountNum = parseFloat(requestedAmount);
      const ltvRatio = (requestedAmountNum / property.appraisedValue) * 100;

      // Validate LTV ratio (max 90%)
      if (ltvRatio > 90) {
        res.status(400).json({
          success: false,
          error: 'Loan-to-value ratio cannot exceed 90%'
        });
        return;
      }

      // Generate unique application ID
      const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Prepare file paths
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const fileData: any = {};

      if (files.financialStatements?.length) {
        fileData.financialStatements = files.financialStatements.map(file => file.path);
      }
      if (files.taxReturns?.length) {
        fileData.taxReturns = files.taxReturns.map(file => file.path);
      }
      if (files.bankStatements?.length) {
        fileData.bankStatements = files.bankStatements.map(file => file.path);
      }
      if (files.additionalDocs?.length) {
        fileData.additionalDocs = files.additionalDocs.map(file => file.path);
      }

      // Create loan application
      const application = await prisma.loanApplication.create({
        data: {
          applicationId,
          borrowerId: user.id,
          propertyId,
          requestedAmount: requestedAmountNum,
          termMonths: parseInt(termMonths),
          interestRate: interestRate ? parseFloat(interestRate) : 0.08,
          ltvRatio,
          purpose: loanPurpose || 'Working Capital',
          status: 'DRAFT',
          // Store additional data as JSON
          additionalDocs: fileData.additionalDocs ? JSON.stringify(fileData.additionalDocs) : null
        }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'LOAN_APPLICATION_CREATED',
          entityType: 'LoanApplication',
          entityId: application.id,
          userId: user.id,
          walletAddress: user.walletAddress,
          newValues: {
            applicationId,
            requestedAmount: requestedAmountNum,
            ltvRatio,
            propertyId
          }
        }
      });

      res.status(201).json({
        success: true,
        data: application,
        message: 'Loan application submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// Update loan application
export const updateLoanApplication = [
  upload.fields([
    { name: 'financialStatements', maxCount: 5 },
    { name: 'taxReturns', maxCount: 3 },
    { name: 'bankStatements', maxCount: 5 },
    { name: 'additionalDocs', maxCount: 10 }
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required'
        });
        return;
      }

      // Get existing application
      const existingApplication = await prisma.loanApplication.findUnique({
        where: { id }
      });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          error: 'Loan application not found'
        });
        return;
      }

      // Prepare update data
      const updateFields: any = {};

      if (updateData.requestedAmount) updateFields.requestedAmount = parseFloat(updateData.requestedAmount);
      if (updateData.termMonths) updateFields.termMonths = parseInt(updateData.termMonths);
      if (updateData.interestRate) updateFields.interestRate = parseFloat(updateData.interestRate);
      if (updateData.purpose) updateFields.purpose = updateData.purpose;
      if (updateData.status) updateFields.status = updateData.status;

      // Recalculate LTV if amount changed
      if (updateData.requestedAmount) {
        const property = await prisma.property.findUnique({
          where: { id: existingApplication.propertyId }
        });
        if (property) {
          updateFields.ltvRatio = (parseFloat(updateData.requestedAmount) / property.appraisedValue) * 100;
        }
      }

      // Handle file uploads
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.additionalDocs?.length) {
        updateFields.additionalDocs = JSON.stringify(files.additionalDocs.map(file => file.path));
      }

      // Update application
      const updatedApplication = await prisma.loanApplication.update({
        where: { id },
        data: updateFields
      });

      // Log the update
      await prisma.auditLog.create({
        data: {
          action: 'LOAN_APPLICATION_UPDATED',
          entityType: 'LoanApplication',
          entityId: id,
          oldValues: existingApplication,
          newValues: updateFields
        }
      });

      res.json({
        success: true,
        data: updatedApplication,
        message: 'Loan application updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

// Submit loan application for review
export const submitLoanApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
      return;
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Loan application not found'
      });
      return;
    }

    // Update status to submitted
    const updatedApplication = await prisma.loanApplication.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date()
      }
    });

    // Log the submission
    await prisma.auditLog.create({
      data: {
        action: 'LOAN_APPLICATION_SUBMITTED',
        entityType: 'LoanApplication',
        entityId: id,
        newValues: {
          status: 'SUBMITTED',
          submittedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: updatedApplication,
      message: 'Loan application submitted for review'
    });
  } catch (error) {
    next(error);
  }
};

// Approve loan application
export const approveLoanApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvedAmount, approvedRate, approvedTerm } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
      return;
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id },
      include: { borrower: true, property: true }
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Loan application not found'
      });
      return;
    }

    // Update application status
    await prisma.loanApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        reviewedAt: new Date()
      }
    });

    // Create loan record
    const loanId = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const loan = await prisma.loan.create({
      data: {
        loanId,
        applicationId: application.id,
        borrowerId: application.borrowerId,
        principalAmount: approvedAmount || application.requestedAmount,
        interestRate: approvedRate || application.interestRate,
        termMonths: approvedTerm || application.termMonths,
        ltvRatio: application.ltvRatio,
        status: 'APPROVED',
        maturityDate: new Date(Date.now() + ((approvedTerm || application.termMonths) * 30 * 24 * 60 * 60 * 1000)), // Approximate months to date
        remainingBalance: approvedAmount || application.requestedAmount
      }
    });

    // Log the approval
    await prisma.auditLog.create({
      data: {
        action: 'LOAN_APPLICATION_APPROVED',
        entityType: 'LoanApplication',
        entityId: id,
        newValues: {
          status: 'APPROVED',
          loanId: loan.id
        }
      }
    });

    res.json({
      success: true,
      data: { application, loan },
      message: 'Loan application approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Reject loan application
export const rejectLoanApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
      return;
    }

    const application = await prisma.loanApplication.findUnique({
      where: { id }
    });

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Loan application not found'
      });
      return;
    }

    // Update application status
    const updatedApplication = await prisma.loanApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        reviewedAt: new Date(),
        rejectionReason: reason || 'Application rejected by reviewer'
      }
    });

    // Log the rejection
    await prisma.auditLog.create({
      data: {
        action: 'LOAN_APPLICATION_REJECTED',
        entityType: 'LoanApplication',
        entityId: id,
        newValues: {
          status: 'REJECTED',
          rejectionReason: reason || 'Application rejected by reviewer'
        }
      }
    });

    res.json({
      success: true,
      data: updatedApplication,
      message: 'Loan application rejected'
    });
  } catch (error) {
    next(error);
  }
};

// Get loan application statistics
export const getLoanStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      res.json({
        success: true,
        data: {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          totalRequested: 0,
          totalApproved: 0
        }
      });
      return;
    }

    const applications = await prisma.loanApplication.findMany({
      where: { borrowerId: user.id }
    });

    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW').length,
      approvedApplications: applications.filter(app => app.status === 'APPROVED').length,
      rejectedApplications: applications.filter(app => app.status === 'REJECTED').length,
      totalRequested: applications.reduce((sum, app) => sum + app.requestedAmount, 0),
      totalApproved: applications
        .filter(app => app.status === 'APPROVED')
        .reduce((sum, app) => sum + app.requestedAmount, 0)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
