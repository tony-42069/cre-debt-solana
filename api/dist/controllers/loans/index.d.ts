import { Request, Response, NextFunction } from 'express';
export declare const getLoanApplications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLoanApplication: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createLoanApplication: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const updateLoanApplication: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare const submitLoanApplication: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const approveLoanApplication: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rejectLoanApplication: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLoanStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=index.d.ts.map