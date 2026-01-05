import 'dotenv/config';
import { db } from '../src/db';
import { users } from '../src/db/schema';

async function listUsers() {
  try {
    console.log('📋 Liste de tous les utilisateurs dans la base de données:\n');

    const allUsers = await db.select().from(users);

    if (allUsers.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      console.log('💡 Le webhook Clerk n\'a peut-être pas été configuré correctement');
    } else {
      console.log(`✅ ${allUsers.length} utilisateur(s) trouvé(s):\n`);
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Clerk ID: ${user.clerkId}`);
        console.log(`   Nom: ${user.name || 'Non défini'}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Créé le: ${user.createdAt}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

listUsers();
