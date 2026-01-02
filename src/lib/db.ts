import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  console.log('Creating Prisma client...');
  console.log('DATABASE_URL present:', !!connectionString);
  console.log('DATABASE_URL first 30 chars:', connectionString?.substring(0, 30));

  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('CLERK')));
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    console.log('Creating Pool with connection string...');
    const pool = new Pool({ connectionString });
    console.log('Pool created successfully');

    // @ts-ignore - Type incompatibility between Pool versions
    const adapter = new PrismaNeon(pool);
    console.log('Adapter created successfully');

    const client = new PrismaClient({
      adapter,
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
