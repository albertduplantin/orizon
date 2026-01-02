import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // En production, on crée toujours un nouveau client
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL must be set');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);

  prisma = new PrismaClient({
    adapter: adapter as any,
    log: ['error'],
  });
} else {
  // En développement, on réutilise le client existant
  if (!global.cachedPrisma) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL must be set');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);

    global.cachedPrisma = new PrismaClient({
      adapter: adapter as any,
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.cachedPrisma;
}

export { prisma };
