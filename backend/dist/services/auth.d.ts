export declare class AuthService {
    register(email: string, password: string, organizationName: string): Promise<{
        userId: import("mongoose").Types.ObjectId;
        orgId: import("mongoose").Types.ObjectId;
        email: string;
        apiKey: string;
    }>;
    login(email: string, password: string): Promise<{
        userId: import("mongoose").Types.ObjectId;
        email: string;
        role: "ADMIN" | "USER";
        orgId: import("mongoose").Types.ObjectId;
    }>;
    findUserById(userId: string): Promise<(import("@/models/User").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    validateApiKey(apiKey: string): Promise<(import("@/models/ApiKey").IApiKey & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    createApiKey(organizationId: string, name: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        key: string;
        isActive: boolean;
    }>;
    getApiKeys(organizationId: string): Promise<(import("@/models/ApiKey").IApiKey & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    toggleApiKey(apiKeyId: string, isActive: boolean): Promise<(import("@/models/ApiKey").IApiKey & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.d.ts.map