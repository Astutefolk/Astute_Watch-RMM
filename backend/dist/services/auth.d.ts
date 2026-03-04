export declare class AuthService {
    private prisma;
    private redis;
    private getRedis;
    register(email: string, password: string, organizationName: string): Promise<{
        userId: string;
        orgId: string;
        email: string;
        apiKey: string;
    }>;
    login(email: string, password: string): Promise<{
        userId: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        orgId: string;
    }>;
    findUserById(userId: string): Promise<{
        role: import(".prisma/client").$Enums.Role;
        id: string;
        email: string;
        organizationId: string;
    } | null>;
    validateApiKey(apiKey: string): Promise<({
        orgId: {
            id: string;
        };
    } & {
        name: string;
        id: string;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        isActive: boolean;
    }) | null>;
}
//# sourceMappingURL=auth.d.ts.map