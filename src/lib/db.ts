import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  console.log('Creating Prisma client...');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    console.log('PrismaClient created successfully');
    return client;
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
}

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
