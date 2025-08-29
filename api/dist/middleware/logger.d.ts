import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
declare const logger: winston.Logger;
export declare const loggerMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export { logger };
//# sourceMappingURL=logger.d.ts.map