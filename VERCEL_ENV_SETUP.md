# Configuration des Variables d'Environnement Vercel

Le déploiement nécessite que vous configuriez les variables d'environnement. Vous avez deux options :

## Option 1 : Via l'interface Vercel (Recommandé)

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet "orizon"
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez les variables suivantes :

### Variables requises :

#### DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Votre connection string Neon PostgreSQL
  ```
  postgresql://user:password@host/database?sslmode=require
  ```
- **Environment**: Production, Preview, Development

#### NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Name**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value**: Votre clé publique Clerk (commence par `pk_test_...`)
- **Environment**: Production, Preview, Development

#### CLERK_SECRET_KEY
- **Name**: `CLERK_SECRET_KEY`
- **Value**: Votre clé secrète Clerk (commence par `sk_test_...`)
- **Environment**: Production, Preview, Development

#### CLERK_WEBHOOK_SECRET
- **Name**: `CLERK_WEBHOOK_SECRET`
- **Value**: Le secret du webhook Clerk (commence par `whsec_...`)
- **Environment**: Production, Preview, Development

#### Variables Clerk URLs (optionnelles, valeurs par défaut)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`

5. Cliquez sur **Save** pour chaque variable

6. Une fois toutes les variables ajoutées, allez dans **Deployments**

7. Cliquez sur les trois points (...) du dernier déploiement échoué

8. Cliquez sur **Redeploy**

## Option 2 : Via Vercel CLI

```bash
# Se connecter à Vercel
vercel login

# Ajouter les variables d'environnement
vercel env add DATABASE_URL production
# Coller votre connection string PostgreSQL

vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Coller votre clé publique Clerk

vercel env add CLERK_SECRET_KEY production
# Coller votre clé secrète Clerk

vercel env add CLERK_WEBHOOK_SECRET production
# Coller votre secret webhook Clerk

# Redéployer
vercel --prod
```

## Comment obtenir les valeurs ?

### DATABASE_URL (Neon PostgreSQL)
1. Allez sur https://console.neon.tech
2. Sélectionnez votre projet
3. Cliquez sur **Connection Details**
4. Copiez la **Connection String**
5. Assurez-vous qu'elle se termine par `?sslmode=require`

### CLERK_* (Clerk Authentication)
1. Allez sur https://dashboard.clerk.com
2. Sélectionnez votre application
3. Allez dans **API Keys**
4. Copiez les clés suivantes :
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

### CLERK_WEBHOOK_SECRET
1. Dans le dashboard Clerk, allez dans **Webhooks**
2. Si vous n'avez pas encore créé de webhook :
   - Cliquez sur **Add Endpoint**
   - URL: `https://votre-app.vercel.app/api/webhooks/clerk`
   - Événements : `user.created`, `user.updated`, `user.deleted`
3. Copiez le **Signing Secret** → `CLERK_WEBHOOK_SECRET`

## Vérification

Une fois les variables configurées et le déploiement réussi :

1. Visitez votre URL Vercel (ex: `https://orizon-xyz.vercel.app`)
2. Testez la création de compte
3. Testez la création d'un événement
4. Vérifiez que les données sont bien enregistrées dans Neon

## Problèmes courants

### "Environment Variable references Secret which does not exist"
→ Ajoutez les variables via l'interface Vercel d'abord

### "Database connection failed"
→ Vérifiez que votre DATABASE_URL est correcte et que Neon est bien actif

### "Clerk authentication error"
→ Vérifiez que vos clés Clerk sont correctes et correspondent bien à votre application

### "Webhook not working"
→ Assurez-vous d'avoir configuré le webhook dans Clerk avec la bonne URL

---

**Une fois les variables configurées, le déploiement devrait réussir ! 🚀**
