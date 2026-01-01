# Contexte de Conversation - ORIZON Project

> Cette conversation a débuté dans le navigateur et se poursuit dans VS Code
> Date de début: 2026-01-01

---

## 🎯 RÉSUMÉ DU PROJET

**ORIZON** = Plateforme SaaS multitenant hypermoderne de gestion d'événements/festivals

### Objectifs Validés
- ✅ Architecture modulaire (plugins activables)
- ✅ Multitenant avec PostgreSQL RLS
- ✅ Design liquid glass iOS-like
- ✅ MVP: Module Bénévoles + système invitations codes 6 lettres
- ✅ Stack: Next.js 15, TypeScript, Prisma, Neon, Vercel
- ✅ Gratuit au départ, scalable
- ✅ Conformité RGPD + facturation légale UE

---

## 📋 DÉCISIONS CLÉS PRISES

### 1. Architecture Technique
- **Frontend**: Next.js 15 App Router + TypeScript
- **Backend**: Server Actions + API Routes
- **Database**: Neon PostgreSQL avec Row-Level Security (RLS)
- **ORM**: Prisma
- **Auth**: Auth.js v5 (NextAuth)
- **Hosting**: Vercel (gratuit → scale)
- **Storage**: Cloudflare R2 (Vercel Blob épuisé)
- **Email**: Resend (100/jour gratuit)
- **Payments**: Stripe

### 2. Multitenant
- **Approche**: Pool Model + RLS PostgreSQL
- 1 tenant = 1 événement/festival
- Utilisateurs peuvent appartenir à plusieurs tenants
- Isolation données native DB (sécurité maximale)

### 3. Système de Modules
- Modules activables par tenant
- Architecture plugin pour développement incrémental
- Partage base de données avec tenant_id sur toutes les tables
- Marketplace prévue (phase 4)

**Modules prévus**:
1. ✅ Core (auth, dashboard, settings)
2. ✅ **Bénévoles** (MVP Phase 1)
3. Billetterie (Phase 2)
4. E-commerce/Merch (Phase 2)
5. Organisation/Planning (Phase 2)
6. Communication (Phase 3)
7. Trésorerie/Finance (Phase 3)
8. Accréditations (Phase 3)
9. Cashless (Phase 4)

### 4. RBAC (Permissions)
- **Super Admin**: Vous (accès global)
- **Tenant Admin**: Organisateur festival
- **Module Manager**: Gère un module, peut créer rôles custom
- **Bénévole/Staff**: Accès limité
- **Participant**: Public

### 5. MVP - Module Bénévoles
**3 features essentielles**:
1. Inscription/candidature bénévoles
2. Création missions + rôles custom (par Module Manager)
3. Attribution bénévoles → missions

**Système invitations**:
- Codes 6 lettres uniques (ex: ABC3X7)
- Lien: orizon.app/join/ABC3X7
- Bénévole s'inscrit automatiquement au bon tenant

### 6. Pricing Model
**Hybrid Model**:
- **Free**: 1 événement, 50 bénévoles, 3 modules base
- **Starter**: 29€/mois - 3 événements, 200 bénévoles
- **Pro**: 79€/mois - Illimité
- **Enterprise**: Sur devis
- **Add-on**: 0.50€/bénévole supplémentaire

Super Admin peut offrir gratuitement modules pour période donnée.

### 7. Design System
- **Style**: Liquid Glass (glassmorphism iOS-like)
- **UI Library**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Inspiration**: macOS, iOS 15+, apps comme Linear

### 8. Onboarding UX
**Organisateur**:
1. Inscription (30s)
2. Choix template événement (Festival/Conférence/Salon)
3. Créer premier événement (1min)
4. Interactive walkthrough
5. Checklist démarrage

**Bénévole**:
1. Clic lien invitation code
2. Inscription simplifiée
3. Auto-login → dashboard missions

### 9. Aspects Légaux
**Statut juridique recommandé**:
- **Votre fils (apprenti)**: Micro-entreprise
  - Simple, gratuit, 22% charges
  - Plafond 77,700€ CA/an
  - Activité: "Édition de logiciels applicatifs"

- **Vous (fonctionnaire)**:
  - Option A: Actionnaire passif SASU (autorisé)
  - Option B: Congé création entreprise (1 an)
  - Pour l'instant: conseiller officieux

**Conformité**:
- ✅ RGPD (privacy policy, cookies, DPO si needed)
- ✅ Facturation légale FR/UE (Stripe Tax)
- ✅ CGU/CGV

---

## 🗺️ ROADMAP VALIDÉE

### Phase 1: MVP (Semaines 1-10) - Q1 2026
- Setup projet + Auth + Multitenant
- RBAC de base
- Module Bénévoles (3 features)
- Système invitations codes 6 lettres
- Design liquid glass
- Onboarding flow
- **Objectif**: 10 bêta-testeurs

### Phase 2: Modules Essentiels (Q2 2026)
- Module Billetterie + Stripe
- Module Communication
- Dashboard analytics
- Export données

### Phase 3: Scale & Monétisation (Q3 2026)
- Stripe billing automatisé
- Modules Organisation + Trésorerie
- API publique v1
- **Objectif**: 10k€ MRR

### Phase 4: IA & Marketplace (Q4 2026)
- MCP Server pour contrôle IA
- Assistant IA conversationnel
- Marketplace modules tiers
- **Objectif**: 50k€ MRR

---

## 📊 SCHÉMA BASE DE DONNÉES (Prisma)

Voir **PROJECT_SPEC.md** section "Database Schema" pour le schéma Prisma complet.

**Tables principales**:
- `users` (Auth.js)
- `tenants` (événements/festivals)
- `tenant_members` (appartenance user → tenant)
- `tenant_modules` (modules activés par tenant)
- `roles` + `user_roles` (RBAC)
- `invite_codes` (codes 6 lettres)
- `volunteers` (module bénévoles)
- `volunteer_missions`
- `volunteer_roles`
- `volunteer_assignments`

**RLS (Row-Level Security)**:
```sql
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.current_tenant')::TEXT);
```

---

## 🎨 DESIGN SYSTEM - Aperçu

```css
/* Liquid Glass Variables */
:root {
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  --blur-md: blur(16px);
}
```

**Composants clés**:
- GlassCard
- AnimatedButton (Framer Motion)
- InteractiveTour (onboarding)
- InviteCodeGenerator

---

## 🔄 ÉTAT ACTUEL DE LA CONVERSATION

### Ce qui a été fait
- ✅ Analyses approfondies (concurrence, onboarding, juridique, architecture)
- ✅ Décisions validées sur toutes les questions
- ✅ Création **PROJECT_SPEC.md** (spec complète 100+ pages)
- ✅ Schéma DB Prisma complet
- ✅ Architecture modulaire définie
- ✅ Pricing model établi
- ✅ Roadmap 4 phases détaillée

### Ce qui reste à faire
- ⏳ Initialisation projet Next.js 15
- ⏳ Setup Neon PostgreSQL
- ⏳ Configuration Auth.js v5
- ⏳ Implémentation RLS
- ⏳ Premiers composants UI liquid glass
- ⏳ Module Bénévoles MVP

---

## 💬 DERNIERS ÉCHANGES

**Vous**: "je valide. arrange toi que quand je vais basculer sur vs code on voit la conversation pour pouvoir la poursuivre dans vscode. je ne sais pas comment faire ca"

**Moi (Claude)**: Création de ce fichier contexte + instructions pour continuer dans VS Code

---

## ▶️ POUR CONTINUER DANS VS CODE

### Étape 1: Ouvrir le projet dans VS Code
```bash
cd D:\Documents\aiprojets\orizon
code .
```

### Étape 2: Vérifier que Claude Code (CLI) est installé
Si pas encore installé :
```bash
npm install -g @anthropic/claude-code
```

### Étape 3: Dans VS Code, ouvrir le terminal intégré
`Ctrl + ù` ou Menu → Terminal → New Terminal

### Étape 4: Lancer Claude Code
```bash
claude
```

### Étape 5: Référencer ce contexte
Dans la conversation Claude Code, dites :

```
Je continue le projet ORIZON depuis le navigateur.
Lis le fichier .claude/chat-context.md pour avoir tout le contexte.
Lis aussi PROJECT_SPEC.md pour la spec complète.

On est prêt à démarrer la Phase 1 : initialisation du projet Next.js 15.
```

---

## 📁 FICHIERS IMPORTANTS DÉJÀ CRÉÉS

1. **PROJECT_SPEC.md** → Spécification complète (référence unique)
2. **.claude/chat-context.md** → Ce fichier (contexte conversation)
3. Schéma sketch photo (votre schéma initial des modules)

---

## 🚀 PROCHAINE ACTION IMMÉDIATE

Dans VS Code avec Claude Code, lancer :

```bash
# Initialiser Next.js 15 avec toutes les configs
pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# Installer dépendances core
pnpm add @prisma/client @auth/prisma-adapter next-auth@beta zod react-hook-form @hookform/resolvers

# Dev dependencies
pnpm add -D prisma @types/node

# UI (Shadcn)
pnpx shadcn-ui@latest init
```

Puis configuration Prisma, Neon, Auth.js...

---

## 📝 NOTES IMPORTANTES

- **Stack 100% gratuit au début** (Vercel Hobby, Neon Free, Cloudflare R2)
- **TypeScript strict mode** pour qualité code maximale
- **Architecture pensée pour être évolutive** dès le début
- **Module system** = facilite ajout features au fur et à mesure
- **RLS PostgreSQL** = sécurité native DB (pas de risque oubli WHERE tenant_id)

---

## 🎯 OBJECTIF PHASE 1 (10 semaines)

Livrer un MVP fonctionnel avec :
- ✅ Auth complète (email + Google OAuth)
- ✅ Création tenant/événement
- ✅ Module Bénévoles (inscription, missions, rôles, attribution)
- ✅ Système invitations codes 6 lettres
- ✅ Design liquid glass (composants de base)
- ✅ Déployé sur Vercel (production)

**Critères de succès**:
- Organisateur crée événement en < 5 min
- Bénévole s'inscrit via code en < 3 min
- 0 bugs critiques
- Lighthouse score > 90

---

**PRÊT À CONTINUER DANS VS CODE !** 🚀

*Rappel: Toutes les décisions et specs sont dans PROJECT_SPEC.md*
