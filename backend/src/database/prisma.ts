import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function initDb() {
  try {
    const prismaClient = getPrisma();
    await prismaClient.$connect();
    console.log('Database connected successfully');
    return prismaClient;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDb() {
  if (prisma) {
    await prisma.$disconnect();
  }
}
