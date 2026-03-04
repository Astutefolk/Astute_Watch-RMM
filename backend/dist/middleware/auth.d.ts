import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '@/types/index';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
            orgId?: string;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Response | void;
export declare function adminMiddleware(req: Request, res: Response, next: NextFunction): Response | void;
export declare function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): Response | void;
export declare function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>>;
export declare function notFoundHandler(req: Request, res: Response): Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map