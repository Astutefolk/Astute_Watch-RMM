import { PrismaClient } from '@prisma/client';
export declare function getPrisma(): PrismaClient;
export declare function initDb(): Promise<PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>>;
export declare function closeDb(): Promise<void>;
//# sourceMappingURL=prisma.d.ts.map