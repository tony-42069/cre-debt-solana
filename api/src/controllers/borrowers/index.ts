import { Request, Response, NextFunction } from 'express';

export const getBorrowers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, message: 'Get borrowers endpoint - Coming soon!' });
  } catch (error) {
    next(error);
  }
};

export const getBorrower = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, message: 'Get borrower endpoint - Coming soon!' });
  } catch (error) {
    next(error);
  }
};

export const createBorrower = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, message: 'Create borrower endpoint - Coming soon!' });
  } catch (error) {
    next(error);
  }
};

export const updateBorrowerKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, message: 'Update borrower KYC endpoint - Coming soon!' });
  } catch (error) {
    next(error);
  }
};
