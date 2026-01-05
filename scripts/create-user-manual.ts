import 'dotenv/config';
import { db } from '../src/db';
import { users } from '../src/db/schema';

async function createUserManually(email: string, clerkId: string, name?: string) {
  try {
    console.log(`🔍 Création manuelle de l'utilisateur ${email}...`);

    const result = await db.insert(users).values({
      clerkId: clerkId,
      email: email,
      name: name || null,
      role: 'super_admin', // Directement super_admin
      image: null,
      phone: null,
    }).returning();

    if (result.length > 0) {
      console.log(`✅ Utilisateur créé avec succès !`);
      console.log(`📊 Détails:`, {
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
        role: result[0].role,
        clerkId: result[0].clerkId,
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Usage: npm run create-user <email> <clerkId> [name]
const email = process.argv[2];
const clerkId = process.argv[3];
const name = process.argv[4];

if (!email || !clerkId) {
  console.log('❌ Usage: npm run create-user <email> <clerkId> [name]');
  console.log('📝 Exemple: npm run create-user topinambour124@gmail.com user_xxx "Albert"');
  process.exit(1);
}

createUserManually(email, clerkId, name);
