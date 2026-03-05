import { Request, Response } from 'express';
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function me(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getApiKeys(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function createApiKey(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function toggleApiKey(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.d.ts.map