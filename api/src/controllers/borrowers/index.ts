import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BorrowerParams {
  walletAddress: string;
  entityType: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  metadataUri?: string;
}

export const getBorrowers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      res.json({
        success: true,
        data: null,
        message: 'No borrower profile found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getBorrower = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Borrower ID is required'
      });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Borrower not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const createBorrower = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      walletAddress,
      entityType,
      email,
      phone
    } = req.body as BorrowerParams;

    if (!walletAddress || !entityType) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, entityType'
      });
      return;
    }

    const validEntityTypes = ['INDIVIDUAL', 'LLC', 'CORPORATION', 'PARTNERSHIP', 'TRUST', 'OTHER'];
    if (!validEntityTypes.includes(entityType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid entity type'
      });
      return;
    }

    const existingUser = await prisma.users.findUnique({
      where: { walletAddress }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User profile already exists for this wallet',
        data: existingUser
      });
      return;
    }

    const user = await prisma.users.create({
      data: {
        walletAddress,
        entityType,
        email: email ?? null
      } as any
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Borrower profile created successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const updateBorrowerKyc = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { kycStatus, kycProvider } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Borrower ID is required'
      });
      return;
    }

    const validKycStatuses = ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED', 'EXPIRED'];
    if (kycStatus && !validKycStatuses.includes(kycStatus)) {
      res.status(400).json({
        success: false,
        error: 'Invalid KYC status'
      });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { id }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Borrower not found'
      });
      return;
    }

    const updateData: any = {};

    if (kycStatus) {
      updateData.kycStatus = kycStatus;
      updateData.kycVerifiedAt = kycStatus === 'VERIFIED' ? new Date() : undefined;
    }

    if (kycProvider) {
      updateData.kycProvider = kycProvider;
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Borrower KYC status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getBorrowerByWallet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
