import { Request, Response, NextFunction } from 'express';
interface AppError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}
export declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map