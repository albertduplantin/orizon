# Configuration de Clerk pour ORIZON

Ce guide vous aide à configurer l'authentification Clerk pour ORIZON.

## 1. Créer un compte Clerk

1. Allez sur https://clerk.com/
2. Créez un compte gratuit
3. Créez une nouvelle application "ORIZON"

## 2. Configurer les providers OAuth

Dans le dashboard Clerk:

1. Allez dans **Configure** → **SSO Connections**
2. Activez **Google** et **Apple** (ou d'autres providers)
3. Pour Google, vous devrez fournir:
   - Client ID de Google Cloud Console
   - Client Secret de Google Cloud Console
4. Clerk gère automatiquement les redirect URIs

## 3. Activer la collecte du numéro de téléphone

1. Allez dans **Configure** → **User & Authentication**
2. Cliquez sur **Phone Number**
3. Activez "Required" pour rendre le champ obligatoire
4. Cliquez sur **Save**

## 4. Récupérer vos clés API

1. Allez dans **API Keys** dans le menu
2. Copiez les valeurs suivantes:
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...`)

## 5. Configurer les variables d'environnement

Ouvrez le fichier `.env.local` et remplacez:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_votre_cle_publique
CLERK_SECRET_KEY=sk_test_votre_cle_secrete
```

## 6. Configurer le Webhook (Optionnel mais recommandé)

Le webhook synchronise automatiquement les utilisateurs Clerk avec votre base de données Prisma.

1. Dans le dashboard Clerk, allez dans **Webhooks**
2. Cliquez sur **Add Endpoint**
3. URL du endpoint:
   - **Développement**: Utilisez [Ngrok](https://ngrok.com/) ou [Svix CLI](https://www.svix.com/docs/cli/)
     ```bash
     npx svix-cli listen http://localhost:3000/api/webhooks/clerk
     ```
   - **Production**: `https://votre-domaine.vercel.app/api/webhooks/clerk`

4. Sélectionnez les événements:
   - `user.created`
   - `user.updated`
   - `user.deleted`

5. Copiez le **Signing Secret** et ajoutez-le dans `.env.local`:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_votre_secret
   ```

## 7. Personnaliser l'apparence (Optionnel)

Dans le dashboard Clerk:

1. Allez dans **Customization** → **Themes**
2. Personnalisez les couleurs pour correspondre à ORIZON
3. Les couleurs recommandées:
   - Primary: `#3b82f6` (Bleu)
   - Accent: `#a855f7` (Violet)

## 8. Tester l'authentification

```bash
npm run dev
```

1. Allez sur http://localhost:3000/sign-up
2. Créez un compte avec Google ou email
3. Vérifiez que le numéro de téléphone est demandé
4. Après inscription, vous devriez être redirigé vers `/dashboard`

## 9. Déploiement sur Vercel

1. Ajoutez les variables d'environnement dans Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_WEBHOOK_SECRET`
   - `DATABASE_URL`

2. Mettez à jour l'URL du webhook dans Clerk avec votre domaine Vercel

## Ressources

- [Documentation Clerk](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Organizations (pour multitenant)](https://clerk.com/docs/organizations/overview)

## Support

Pour toute question, consultez:
- [Discord Clerk](https://clerk.com/discord)
- [Documentation ORIZON](./README.md)
