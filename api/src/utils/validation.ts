import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation error handler
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(err => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
    return;
  }
  next();
}

// Wallet address validation
export const walletAddressValidation: ValidationChain = body('walletAddress')
  .isString()
  .withMessage('Wallet address must be a string')
  .isLength({ min: 32, max: 44 })
  .withMessage('Invalid Solana wallet address length')
  .matches(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
  .withMessage('Invalid Solana wallet address format');

// Property validations
export const propertyValidations: ValidationChain[] = [
  body('propertyType')
    .isString()
    .withMessage('Property type must be a string')
    .isIn(['OFFICE', 'RETAIL', 'INDUSTRIAL', 'MULTIFAMILY', 'HOSPITALITY', 'LAND', 'SPECIALTY'])
    .withMessage('Invalid property type'),
  body('address')
    .isString()
    .withMessage('Address must be a string')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  body('city')
    .isString()
    .withMessage('City must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('state')
    .isString()
    .withMessage('State must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('zipCode')
    .isString()
    .withMessage('ZIP code must be a string')
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid ZIP code format'),
  body('appraisedValue')
    .isNumeric()
    .withMessage('Appraised value must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Appraised value cannot be negative');
      }
      if (value > 10000000000) { // 10 billion max
        throw new Error('Appraised value exceeds maximum allowed');
      }
      return true;
    })
];

// Loan application validations
export const loanApplicationValidations: ValidationChain[] = [
  body('propertyId')
    .isString()
    .withMessage('Property ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('Property ID is required'),
  body('requestedAmount')
    .isNumeric()
    .withMessage('Requested amount must be a number')
    .custom((value) => {
      if (value < 100000) {
        throw new Error('Minimum loan amount is $100,000');
      }
      if (value > 10000000) { // 10 million max
        throw new Error('Requested amount exceeds maximum allowed');
      }
      return true;
    }),
  body('termMonths')
    .isInt({ min: 12, max: 360 })
    .withMessage('Loan term must be between 12 and 360 months'),
  body('interestRate')
    .optional()
    .isFloat({ min: 0.05, max: 0.30 })
    .withMessage('Interest rate must be between 5% and 30%'),
  body('loanPurpose')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Loan purpose must be at most 500 characters')
];

// Payment validations
export const paymentValidations: ValidationChain[] = [
  body('loanId')
    .isString()
    .withMessage('Loan ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('Loan ID is required'),
  body('amount')
    .isNumeric()
    .withMessage('Payment amount must be a number')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('Payment amount must be positive');
      }
      if (value > 10000000) { // 10 million max payment
        throw new Error('Payment amount exceeds maximum allowed');
      }
      return true;
    }),
  body('paymentMethod')
    .optional()
    .isIn(['usdc', 'wire'])
    .withMessage('Payment method must be usdc or wire')
];

// ID parameter validation
export const idParamValidation: ValidationChain[] = [
  param('id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('ID is required')
    .isLength({ max: 100 })
    .withMessage('ID is too long')
];

// Wallet address query validation
export const walletAddressQueryValidation: ValidationChain[] = [
  query('walletAddress')
    .isString()
    .withMessage('Wallet address must be a string')
    .isLength({ min: 32, max: 44 })
    .withMessage('Invalid wallet address length')
];

// Sanitization helpers
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
}

export function sanitizeNumber(value: number, min?: number, max?: number): number {
  const sanitized = Math.abs(Number(value) || 0);
  if (min !== undefined && sanitized < min) return min;
  if (max !== undefined && sanitized > max) return max;
  return sanitized;
}

export function sanitizeForHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
