"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrisma = getPrisma;
exports.initDb = initDb;
exports.closeDb = closeDb;
const client_1 = require("@prisma/client");
let prisma;
function getPrisma() {
    if (!prisma) {
        prisma = new client_1.PrismaClient();
    }
    return prisma;
}
async function initDb() {
    try {
        const prismaClient = getPrisma();
        await prismaClient.$connect();
        console.log('Database connected successfully');
        return prismaClient;
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
    }
}
async function closeDb() {
    if (prisma) {
        await prisma.$disconnect();
    }
}
//# sourceMappingURL=prisma.js.map