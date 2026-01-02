# Guide de Déploiement ORIZON sur Vercel

## Prérequis

1. **Compte Vercel** : https://vercel.com/signup
2. **Compte Neon** (PostgreSQL) : https://console.neon.tech/signup
3. **Compte Clerk** (Authentification) : https://dashboard.clerk.com/sign-up
4. **Compte GitHub** : Pour héberger le code source

## Étape 1 : Préparer la base de données Neon

1. Connectez-vous à https://console.neon.tech
2. Créez un nouveau projet
3. Copiez la connection string (elle ressemble à `postgresql://user:pass@host/db?sslmode=require`)
4. Gardez cette URL, vous en aurez besoin pour Vercel

## Étape 2 : Configurer Clerk

1. Connectez-vous à https://dashboard.clerk.com
2. Créez une nouvelle application
3. Notez les clés suivantes :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (commence par `pk_test_...`)
   - `CLERK_SECRET_KEY` (commence par `sk_test_...`)

### Configurer le webhook Clerk

1. Dans le dashboard Clerk, allez dans **Webhooks**
2. Cliquez sur **Add Endpoint**
3. URL du webhook : `https://VOTRE-DOMAINE.vercel.app/api/webhooks/clerk`
   - Remplacez `VOTRE-DOMAINE` par votre URL Vercel (vous l'obtiendrez après le déploiement)
4. Sélectionnez les événements :
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Créez l'endpoint et copiez le **Signing Secret** (commence par `whsec_...`)
6. Gardez ce secret pour l'étape suivante

## Étape 3 : Pousser le code sur GitHub

```bash
# Ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "Prêt pour le déploiement sur Vercel"

# Pousser sur GitHub
git push origin main
```

## Étape 4 : Déployer sur Vercel

### Option A : Via l'interface Vercel (Recommandé)

1. Allez sur https://vercel.com/new
2. Importez votre repository GitHub
3. Configurez les variables d'environnement :

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

4. Cliquez sur **Deploy**
5. Attendez que le déploiement se termine (~2-3 minutes)

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement via l'interface web
# ou utiliser la commande :
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_WEBHOOK_SECRET

# Redéployer avec les nouvelles variables
vercel --prod
```

## Étape 5 : Initialiser la base de données

Une fois déployé, vous devez pousser le schéma Prisma vers votre base de données :

```bash
# Définir l'URL de la base de données
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Pousser le schéma vers la base de données
npx prisma db push
```

**Ou** utilisez l'interface Neon :
1. Allez dans votre projet Neon
2. Ouvrez l'éditeur SQL
3. Le schéma sera automatiquement créé lors de la première connexion de l'application

## Étape 6 : Mettre à jour le webhook Clerk

1. Retournez dans le dashboard Clerk
2. Modifiez votre endpoint webhook
3. Remplacez l'URL par votre vraie URL Vercel : `https://votre-app.vercel.app/api/webhooks/clerk`
4. Sauvegardez

## Étape 7 : Tester l'application

1. Visitez `https://votre-app.vercel.app`
2. Créez un compte
3. Créez votre premier événement
4. Testez le module Bénévoles
5. Générez un code d'invitation et testez-le

## Variables d'environnement requises

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `DATABASE_URL` | Connection string PostgreSQL | Neon Console |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clé publique Clerk | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clé secrète Clerk | Clerk Dashboard |
| `CLERK_WEBHOOK_SECRET` | Secret du webhook Clerk | Clerk Webhooks |

## Dépannage

### Erreur de connexion à la base de données
- Vérifiez que `DATABASE_URL` est correctement configurée
- Assurez-vous que `?sslmode=require` est à la fin de l'URL
- Vérifiez que votre base Neon est bien active

### Erreur d'authentification Clerk
- Vérifiez que les clés Clerk sont correctes
- Assurez-vous que les URLs de redirection sont correctes
- Vérifiez que le webhook est bien configuré avec la bonne URL

### Build échoue sur Vercel
- Vérifiez les logs de build dans Vercel
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez qu'il n'y a pas d'erreurs TypeScript

### Le webhook ne fonctionne pas
- Vérifiez l'URL du webhook dans Clerk
- Testez manuellement le webhook dans le dashboard Clerk
- Vérifiez les logs de fonction dans Vercel

## Déploiements automatiques

Une fois configuré, Vercel déploiera automatiquement :
- **Déploiement de production** : À chaque push sur `main`
- **Déploiements de preview** : À chaque Pull Request

## Domaine personnalisé

Pour ajouter votre propre domaine :
1. Allez dans Settings > Domains dans Vercel
2. Ajoutez votre domaine
3. Configurez les DNS selon les instructions
4. Mettez à jour l'URL du webhook Clerk avec votre nouveau domaine

## Monitoring

- **Logs** : Disponibles dans Vercel Dashboard > Logs
- **Analytics** : Vercel Analytics activé automatiquement
- **Erreurs** : Surveillez les erreurs dans Vercel > Functions

## Support

Pour toute question ou problème :
- Documentation Vercel : https://vercel.com/docs
- Documentation Clerk : https://clerk.com/docs
- Documentation Neon : https://neon.tech/docs
- Documentation Next.js : https://nextjs.org/docs

---

**Bon déploiement ! 🚀**
