import { prisma, PrismaClient } from '@repo/db';
import { createLogger } from './logger.js';

const logger = createLogger('PrismaClient');

export function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    logger.success('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed', error);
    return false;
  }
}
