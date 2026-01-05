import 'dotenv/config';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function setSuperAdmin(email: string) {
  try {
    console.log(`🔍 Recherche de l'utilisateur avec l'email: ${email}...`);

    const result = await db.update(users)
      .set({ role: 'super_admin' })
      .where(eq(users.email, email))
      .returning();

    if (result.length > 0) {
      console.log(`✅ Succès ! L'utilisateur ${email} est maintenant super_admin`);
      console.log(`📊 Détails:`, {
        id: result[0].id,
        name: result[0].name,
        email: result[0].email,
        role: result[0].role,
      });
    } else {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${email}`);
      console.log(`💡 Assurez-vous que l'utilisateur s'est déjà connecté au moins une fois`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Récupérer l'email depuis les arguments de ligne de commande
const email = process.argv[2];

if (!email) {
  console.log('❌ Usage: npm run set-admin <email>');
  console.log('📝 Exemple: npm run set-admin john@example.com');
  process.exit(1);
}

// Valider le format email basique
if (!email.includes('@')) {
  console.log('❌ Format d\'email invalide');
  process.exit(1);
}

setSuperAdmin(email);
