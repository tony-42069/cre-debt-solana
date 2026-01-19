import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { Request } from 'express';

// Allowed file extensions (lowercase)
const ALLOWED_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']);

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]);

// Maximum file size (10MB per file)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum total request size (50MB)
const MAX_REQUEST_SIZE = 50 * 1024 * 1024;

/**
 * Generate a secure random filename
 * @param originalName - The original filename
 * @returns A secure filename with random UUID
 */
export function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const sanitizedExt = ALLOWED_EXTENSIONS.has(ext.replace('.', '')) ? ext : '.bin';
  const randomId = crypto.randomBytes(8).toString('hex');
  return `${randomId}${sanitizedExt}`;
}

/**
 * Create a sanitized filename for storage
 * @param fieldName - The form field name
 * @param originalName - The original filename
 * @returns Sanitized filename
 */
function sanitizeFilename(fieldName: string, originalName: string): string {
  // Remove any path components
  const baseName = path.basename(originalName);
  // Remove any null bytes or dangerous characters
  const sanitized = baseName.replace(/[\x00-\x1f\x7f]/g, '');
  // Generate secure random name
  const ext = path.extname(sanitized).toLowerCase();
  const safeExt = ALLOWED_EXTENSIONS.has(ext.replace('.', '')) ? ext : '.bin';
  const uniqueId = uuidv4();
  return `${fieldName}-${uniqueId}${safeExt}`;
}

/**
 * Create multer upload middleware with security enhancements
 * @param fieldName - The form field name
 * @param uploadDir - The upload directory (relative to project root)
 * @param maxFiles - Maximum number of files (default 10)
 */
export function createSecureUpload(
  fieldName: string,
  uploadDir: string = 'uploads',
  maxFiles: number = 10
) {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // Use absolute path
        const absoluteUploadDir = path.isAbsolute(uploadDir)
          ? uploadDir
          : path.resolve(process.cwd(), uploadDir);
        cb(null, absoluteUploadDir);
      },
      filename: (req, file, cb) => {
        const safeFilename = sanitizeFilename(fieldName, file.originalname);
        cb(null, safeFilename);
      }
    }),
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: maxFiles,
      parts: maxFiles + 10 // files + non-file fields
    },
    fileFilter: (req, file, cb) => {
      // Check extension
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        cb(new Error(`File type not allowed: .${ext}`));
        return;
      }

      // Check MIME type
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new Error(`MIME type not allowed: ${file.mimetype}`));
        return;
      }

      cb(null, true);
    }
  });
}

/**
 * Create loan application upload middleware
 */
export const loanApplicationUpload = createSecureUpload('loan_app', 'api/uploads', 20);

/**
 * Create property upload middleware
 */
export const propertyUpload = createSecureUpload('property', 'api/uploads', 10);

/**
 * Validate uploaded files for malware indicators
 * @param file - The multer file object
 * @returns Object with isValid and error message
 */
export function validateUploadedFile(file: Express.Multer.File): {
  valid: boolean;
  error?: string;
} {
  // Check for null bytes in content (indicates path traversal attempt)
  if (file.buffer.includes('\x00')) {
    return { valid: false, error: 'File contains null bytes' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // Verify extension matches content type
  const ext = path.extname(file.originalname).toLowerCase();
  const expectedMimeTypes: Record<string, string[]> = {
    '.pdf': ['application/pdf'],
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.doc': ['application/msword'],
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };

  if (expectedMimeTypes[ext] && !expectedMimeTypes[ext].includes(file.mimetype)) {
    return {
      valid: false,
      error: `File extension ${ext} does not match MIME type ${file.mimetype}`
    };
  }

  return { valid: true };
}

/**
 * Get a function to validate total request size
 * @param maxTotalSize - Maximum total request size in bytes
 */
export function createRequestSizeValidator(maxTotalSize: number = MAX_REQUEST_SIZE) {
  return (req: Request): { valid: boolean; error?: string } => {
    const contentLengthStr = req.headers['content-length'] as string ?? '0';
    const contentLength = parseInt(contentLengthStr, 10);
    if (contentLength > maxTotalSize) {
      return {
        valid: false,
        error: `Request body exceeds maximum size of ${maxTotalSize / 1024 / 1024}MB`
      };
    }
    return { valid: true };
  };
}
