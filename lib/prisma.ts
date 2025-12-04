import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const CONNECTION_ERROR_CODES = ['P1000', 'P1001', 'P1002', 'P1008', 'P1017', 'P2024'];

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      let isConnectionError = false;
      
      if (error instanceof Prisma.PrismaClientInitializationError) {
        isConnectionError = true;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        isConnectionError = CONNECTION_ERROR_CODES.includes(error.code);
      } else if (error instanceof Error) {
        isConnectionError = 
          error.message.includes('connection') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('terminating connection') ||
          error.message.includes('administrator command');
      }
      
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Database connection attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}
