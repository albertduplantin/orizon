# Guide de Configuration OAuth - ORIZON

Ce guide vous explique comment configurer Google et Apple OAuth pour permettre aux utilisateurs de se connecter facilement.

---

## 📱 Google OAuth Setup

### Étape 1 : Créer un Projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur **"Nouveau projet"**
3. Nommez votre projet : **"ORIZON"**
4. Cliquez sur **Créer**

### Étape 2 : Activer Google OAuth

1. Dans le menu latéral, allez dans **"APIs & Services" > "Identifiants"**
2. Cliquez sur **"Configurer l'écran de consentement OAuth"**
3. Choisissez **"Externe"** (pour permettre n'importe quel utilisateur Google)
4. Remplissez les informations :
   - **Nom de l'application** : ORIZON
   - **E-mail d'assistance utilisateur** : votre email
   - **Logo de l'application** : (optionnel)
   - **Domaine de l'application** : http://localhost:3001 (développement)
   - **E-mail du développeur** : votre email
5. Cliquez sur **"Enregistrer et continuer"**
6. **Scopes** : Ajoutez les scopes suivants (requis pour Auth.js) :
   - `openid`
   - `email`
   - `profile`
7. Cliquez sur **"Enregistrer et continuer"**
8. **Testeurs** : Ajoutez vos emails de test
9. Cliquez sur **"Enregistrer et continuer"**

### Étape 3 : Créer les Identifiants OAuth

1. Retournez dans **"Identifiants"**
2. Cliquez sur **"Créer des identifiants" > "ID client OAuth 2.0"**
3. Type d'application : **"Application Web"**
4. Nom : **"ORIZON Web Client"**
5. **Origines JavaScript autorisées** :
   ```
   http://localhost:3001
   https://votre-domaine.vercel.app
   ```
6. **URI de redirection autorisés** :
   ```
   http://localhost:3001/api/auth/callback/google
   https://votre-domaine.vercel.app/api/auth/callback/google
   ```
7. Cliquez sur **Créer**
8. **IMPORTANT** : Copiez votre **Client ID** et **Client Secret**

### Étape 4 : Ajouter les Credentials au .env

Ouvrez votre fichier `.env` et ajoutez :

```env
GOOGLE_CLIENT_ID="votre-client-id-ici.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret-ici"
```

---

## 🍎 Apple OAuth Setup

### Étape 1 : Créer un Apple Developer Account

1. Allez sur [Apple Developer](https://developer.apple.com/)
2. Inscrivez-vous au **Apple Developer Program** (99€/an)
3. Connectez-vous avec votre Apple ID

### Étape 2 : Créer un App ID

1. Allez dans **"Certificates, Identifiers & Profiles"**
2. Cliquez sur **"Identifiers" > "+"**
3. Sélectionnez **"App IDs"** → Continuer
4. Sélectionnez **"App"** → Continuer
5. Remplissez :
   - **Description** : ORIZON Web App
   - **Bundle ID** : `com.orizon.webapp` (choisissez votre propre ID unique)
   - **Capabilities** : Cochez **"Sign In with Apple"**
6. Cliquez sur **Continue** puis **Register**

### Étape 3 : Créer un Service ID

1. Retournez dans **"Identifiers" > "+"**
2. Sélectionnez **"Services IDs"** → Continuer
3. Remplissez :
   - **Description** : ORIZON Sign In
   - **Identifier** : `com.orizon.signin` (différent du Bundle ID)
4. Cochez **"Sign In with Apple"**
5. Cliquez sur **Configure** à côté de "Sign In with Apple"
6. Configurez :
   - **Primary App ID** : Sélectionnez l'App ID créé à l'étape 2
   - **Domains and Subdomains** :
     ```
     localhost (pour dev)
     votre-domaine.vercel.app
     ```
   - **Return URLs** :
     ```
     http://localhost:3001/api/auth/callback/apple
     https://votre-domaine.vercel.app/api/auth/callback/apple
     ```
7. Cliquez sur **Save** puis **Continue** puis **Register**

### Étape 4 : Créer une Private Key

1. Allez dans **"Keys" > "+"**
2. Remplissez :
   - **Key Name** : ORIZON Sign In Key
   - **Capabilities** : Cochez **"Sign In with Apple"**
3. Cliquez sur **Configure**
4. Sélectionnez votre **Primary App ID**
5. Cliquez sur **Save** puis **Continue** puis **Register**
6. **IMPORTANT** : Téléchargez la clé (fichier `.p8`) - vous ne pourrez plus la télécharger après !
7. Notez le **Key ID** (affiché en haut)

### Étape 5 : Générer le Client Secret (JWT)

Apple OAuth nécessite un JWT signé comme secret. Voici comment le générer :

#### Option A : Utiliser un outil en ligne (pour tester)
1. Allez sur [apple-auth.simplelogin.io](https://apple-auth.simplelogin.io/)
2. Remplissez les informations :
   - **Team ID** : Trouvez-le dans votre compte Apple Developer (Membership)
   - **Client ID** : Le Service ID créé (`com.orizon.signin`)
   - **Key ID** : L'ID de la clé créée
   - **Private Key** : Collez le contenu du fichier `.p8`
3. Cliquez sur **Generate**
4. Copiez le JWT généré

#### Option B : Générer programmatically (pour production)

Créez un fichier `generate-apple-secret.js` :

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('AuthKey_XXXXXXXXXX.p8', 'utf8');

const token = jwt.sign(
  {},
  privateKey,
  {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: 'YOUR_TEAM_ID',
    audience: 'https://appleid.apple.com',
    subject: 'com.orizon.signin', // Your Service ID
    header: {
      kid: 'YOUR_KEY_ID',
      alg: 'ES256'
    }
  }
);

console.log(token);
```

Exécutez : `node generate-apple-secret.js`

### Étape 6 : Ajouter les Credentials au .env

```env
APPLE_CLIENT_ID="com.orizon.signin"
APPLE_CLIENT_SECRET="eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..." # Le JWT généré
```

**Note** : Le JWT Apple expire après 6 mois maximum. Vous devrez le régénérer régulièrement.

---

## 🔄 Tester l'Authentification

### En Local (http://localhost:3001)

1. Assurez-vous que les variables d'environnement sont configurées dans `.env`
2. Redémarrez votre serveur de développement :
   ```bash
   npm run dev
   ```
3. Allez sur http://localhost:3001/signin
4. Cliquez sur **"Continuer avec Google"** ou **"Continuer avec Apple"**
5. Autorisez l'accès
6. Vous devriez être redirigé vers `/dashboard` (à créer)

### Vérifier la Session

Ajoutez cette page de test : `src/app/test-session/page.tsx`

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TestSession() {
  const session = await auth();

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="p-8">
      <h1>Session Active</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
```

---

## 🚨 Dépannage

### Erreur "redirect_uri_mismatch" (Google)

- Vérifiez que l'URL de redirection dans Google Cloud Console correspond EXACTEMENT à :
  - `http://localhost:3001/api/auth/callback/google` (en dev)
  - `https://votre-domaine.vercel.app/api/auth/callback/google` (en prod)
- Pas d'espace, pas de slash en trop

### Erreur "invalid_client" (Apple)

- Vérifiez que le JWT est valide et n'a pas expiré
- Vérifiez que le Service ID correspond bien au `client_id` dans le JWT
- Vérifiez que le Team ID et Key ID sont corrects

### L'utilisateur n'est pas redirigé après la connexion

- Vérifiez que `NEXTAUTH_URL` dans `.env` correspond à votre URL actuelle
- En dev : `http://localhost:3001`
- En prod : `https://votre-domaine.vercel.app`

---

## 📝 Configuration Vercel (Production)

Lorsque vous déployez sur Vercel :

1. Allez dans **Settings > Environment Variables**
2. Ajoutez les variables :
   ```
   NEXTAUTH_URL=https://votre-domaine.vercel.app
   NEXTAUTH_SECRET=générer-une-clé-aléatoire-sécurisée
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   APPLE_CLIENT_ID=...
   APPLE_CLIENT_SECRET=...
   ```
3. Ajoutez les URLs de production dans Google Cloud Console et Apple Developer
4. Redéployez

---

## ✅ Checklist Finale

- [ ] Google Client ID configuré dans `.env`
- [ ] Google Client Secret configuré dans `.env`
- [ ] URIs de redirection Google ajoutées (dev + prod)
- [ ] Apple Client ID configuré dans `.env`
- [ ] Apple Client Secret (JWT) généré et configuré
- [ ] Apple Return URLs configurées (dev + prod)
- [ ] `NEXTAUTH_SECRET` généré (production)
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Test de connexion Google ✅
- [ ] Test de connexion Apple ✅

---

**Besoin d'aide ?** Consultez la documentation officielle :
- [Auth.js Google Provider](https://authjs.dev/reference/core/providers/google)
- [Auth.js Apple Provider](https://authjs.dev/reference/core/providers/apple)
