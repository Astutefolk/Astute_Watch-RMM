import { Request, Response } from 'express';
export declare function heartbeat(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getDevices(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getDevice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteDevice(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function registerAgent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=device.d.ts.map