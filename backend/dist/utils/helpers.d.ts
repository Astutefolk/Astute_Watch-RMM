import { TokenPayload } from '@/types/index';
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePasswords(password: string, hash: string): Promise<boolean>;
export declare function generateAccessToken(payload: TokenPayload): string;
export declare function generateRefreshToken(userId: string): string;
export declare function verifyAccessToken(token: string): TokenPayload | null;
export declare function verifyRefreshToken(token: string): {
    userId: string;
} | null;
export declare function generateApiKey(): string;
export declare function hashApiKey(apiKey: string): string;
export declare function generateDeviceId(): string;
export declare function isValidEmail(email: string): boolean;
export declare function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
};
export declare function getPaginationParams(page: string | undefined, limit: string | undefined): {
    skip: number;
    take: number;
};
export declare class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const ApiErrors: {
    INVALID_CREDENTIALS: AppError;
    UNAUTHORIZED: AppError;
    FORBIDDEN: AppError;
    NOT_FOUND: AppError;
    CONFLICT: AppError;
    VALIDATION_ERROR: (message: string) => AppError;
    INTERNAL_ERROR: AppError;
};
//# sourceMappingURL=helpers.d.ts.map