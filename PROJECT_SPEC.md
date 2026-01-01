# ORIZON - Plateforme SaaS Multitenant de Gestion d'Événements

> Document de spécification complète - Version initiale
> Date: 2026-01-01

---

## 📋 TABLE DES MATIÈRES

1. [Vision & Concept](#vision--concept)
2. [Architecture Technique](#architecture-technique)
3. [Modèle Multitenant](#modèle-multitenant)
4. [Système de Modules (Plugins)](#système-de-modules-plugins)
5. [RBAC - Gestion des Permissions](#rbac---gestion-des-permissions)
6. [Modules Prévus](#modules-prévus)
7. [MVP - Périmètre Initial](#mvp---périmètre-initial)
8. [Modèle de Monétisation](#modèle-de-monétisation)
9. [Stack Technique Détaillé](#stack-technique-détaillé)
10. [Schéma de Base de Données](#schéma-de-base-de-données)
11. [Onboarding UX](#onboarding-ux)
12. [Design System - Liquid Glass](#design-system---liquid-glass)
13. [Système d'Invitations (Codes 6 lettres)](#système-dinvitations-codes-6-lettres)
14. [Roadmap de Développement](#roadmap-de-développement)
15. [Aspects Légaux & Juridiques](#aspects-légaux--juridiques)
16. [Features Futures (Phase 2+)](#features-futures-phase-2)

---

## 🎯 VISION & CONCEPT

### Problématique
Les organisateurs de festivals, événements, salons et conférences jonglent entre multiples outils disparates (Excel, emails, apps séparées) pour gérer bénévoles, billetterie, logistique, communication, trésorerie.

### Solution
**ORIZON** : Plateforme SaaS tout-en-un, modulaire et hypermoderne, permettant de centraliser toute la gestion d'événements via des modules activables selon les besoins.

### Valeur Unique
- ✅ **Modulaire** : activez uniquement les modules nécessaires
- ✅ **Multitenant** : chaque événement = espace isolé et sécurisé
- ✅ **Scalable** : du petit festival associatif au grand salon professionnel
- ✅ **Moderne** : design liquid glass iOS-like, PWA, IA intégrée
- ✅ **Européen** : RGPD-compliant, facturation légale FR/UE

### Public Cible
- Organisateurs de festivals (musique, arts, culture)
- Gestionnaires d'événements professionnels (salons, conférences)
- Associations organisant des événements récurrents
- Agences événementielles

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Choisi

#### Frontend
- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **UI Library** : Shadcn/ui + Radix UI
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **State Management** : React Server Components + Zustand (client state minimal)
- **Forms** : React Hook Form + Zod validation

#### Backend
- **Runtime** : Node.js (Next.js API Routes / Server Actions)
- **API Pattern** : Server Actions (prioritaire) + API Routes (pour webhooks)
- **ORM** : Prisma
- **Database** : PostgreSQL (Neon)
- **Multitenant** : Row-Level Security (RLS) PostgreSQL

#### Infrastructure
- **Hosting** : Vercel (Hobby Plan gratuit → Pro si scale)
- **Database** : Neon Postgres (Free tier 0.5GB → Scale Plan)
- **Storage** : Cloudflare R2 (10GB gratuit)
- **Auth** : Auth.js v5 (NextAuth)
- **Email** : Resend (100 emails/jour gratuit → Pay-as-you-go)
- **Payments** : Stripe (Standard Connect pour marketplace futur)
- **Analytics** : Vercel Analytics (gratuit)
- **Monitoring** : Sentry (gratuit tier)
- **CI/CD** : GitHub Actions → Vercel auto-deploy

#### Outils Développement
- **Version Control** : Git + GitHub
- **IDE** : Visual Studio Code
- **Package Manager** : pnpm (plus rapide que npm/yarn)
- **Linting** : ESLint + Prettier
- **Type Checking** : TypeScript strict mode
- **Testing** : Vitest (unit) + Playwright (e2e) [Phase 2]

---

## 🏢 MODÈLE MULTITENANT

### Définition
Un **tenant** = un événement/festival distinct avec ses propres :
- Données (bénévoles, participants, planning, etc.)
- Modules activés
- Branding (logo, couleurs, domaine custom futur)
- Abonnement/billing

### Isolation des Données

**Approche choisie : Pool Model + Row-Level Security (RLS)**

#### Pourquoi RLS ?
- ✅ 1 seule base de données = coûts minimaux
- ✅ Sécurité native PostgreSQL (impossible d'oublier WHERE tenant_id)
- ✅ Performance optimale
- ✅ Maintenance simplifiée

#### Implémentation
```sql
-- Toutes les tables ont tenant_id
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy d'isolation
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

#### Configuration Runtime
```typescript
// Middleware Next.js définit le tenant actuel
export async function middleware(request: NextRequest) {
  const tenantId = await getTenantFromRequest(request);

  // Set dans headers pour Server Actions
  request.headers.set('x-tenant-id', tenantId);
}

// Prisma middleware applique RLS
prisma.$use(async (params, next) => {
  await prisma.$executeRaw`SET LOCAL app.current_tenant = ${tenantId}`;
  return next(params);
});
```

### Multi-Tenant UX

#### Cas d'usage :
1. **Marie organise 2 festivals** :
   - 1 compte utilisateur
   - 2 tenants (Festival Rock 2026, Salon Bio 2026)
   - Switch entre tenants via dropdown header

2. **Jean est bénévole sur 3 événements** :
   - 1 compte utilisateur
   - Membre de 3 tenants différents
   - Dashboard unifié montrant tous ses événements
   - Notifications cross-tenant

---

## 🧩 SYSTÈME DE MODULES (PLUGINS)

### Architecture Modulaire

#### Objectif
Permettre d'activer/désactiver des modules par tenant ET d'ajouter de nouveaux modules facilement.

#### Structure
```
/modules
  /core          # Modules système (auth, dashboard, settings)
  /volunteers    # Module Gestion Bénévoles
  /ticketing     # Module Billetterie
  /ecommerce     # Module E-commerce/Merch
  /communication # Module Communication
  /finance       # Module Trésorerie
  /organization  # Module Organisation/Planning
  /[future]      # Modules futurs
```

#### Module Definition
```typescript
// /modules/volunteers/module.config.ts
export const volunteersModule: ModuleDefinition = {
  id: 'volunteers',
  name: 'Gestion Bénévoles',
  description: 'Recrutement, planning et suivi des bénévoles',
  version: '1.0.0',
  icon: 'Users',
  category: 'management',

  // Pricing
  pricing: {
    free: true,
    tier: 'base' // base | premium | enterprise
  },

  // Permissions requises
  permissions: [
    'volunteers.view',
    'volunteers.create',
    'volunteers.assign',
    'volunteers.manage'
  ],

  // Routes
  routes: [
    { path: '/volunteers', component: VolunteersPage },
    { path: '/volunteers/[id]', component: VolunteerDetailPage }
  ],

  // Navigation items
  nav: [
    { label: 'Bénévoles', href: '/volunteers', icon: 'Users' }
  ],

  // Database schema
  schema: volunteersSchema,

  // Lifecycle hooks
  onInstall: async (tenantId) => { /* Setup */ },
  onUninstall: async (tenantId) => { /* Cleanup */ }
};
```

#### Activation Module
```typescript
// Super Admin ou Tenant Admin peut activer
await activateModule(tenantId, 'volunteers');

// DB: tenant_modules
{
  tenant_id: 'uuid',
  module_id: 'volunteers',
  enabled: true,
  activated_at: '2026-01-01',
  expires_at: null // ou date si trial
}
```

#### Dynamic Loading
```typescript
// App layout charge modules actifs
const activeModules = await getActiveModules(tenantId);

activeModules.forEach(module => {
  // Register routes
  registerRoutes(module.routes);

  // Add to navigation
  addNavItems(module.nav);

  // Register permissions
  registerPermissions(module.permissions);
});
```

### Database Schema par Module

Les modules partagent la base principale mais peuvent avoir leurs tables dédiées :

```sql
-- Core tables (tous tenants)
tenants
users
tenant_modules

-- Module Volunteers
volunteers (extends users avec tenant_id)
volunteer_roles
volunteer_missions
volunteer_shifts
volunteer_assignments

-- Module Ticketing
tickets
ticket_types
orders
...
```

---

## 🔐 RBAC - GESTION DES PERMISSIONS

### Rôles Système

#### 1. Super Admin (Vous)
- Accès global à tous les tenants
- Gestion facturation & abonnements
- Activation modules pour clients
- Analytics cross-tenant

#### 2. Tenant Admin (Organisateur)
- Propriétaire du tenant
- Active/désactive modules disponibles
- Gère les utilisateurs et rôles
- Configuration tenant (branding, settings)

#### 3. Module Manager
- Gère UN module spécifique (ex: Chef Bénévoles)
- **Peut créer des rôles custom** au sein de son module
- Assigne utilisateurs à ces rôles
- Voit uniquement son module

#### 4. Bénévole / Staff
- Accès aux modules assignés
- Permissions en lecture principalement
- Peut mettre à jour ses propres infos

#### 5. Participant (Public)
- Accès billetterie
- Profil personnel
- Notifications événement

### Modèle de Permissions

```typescript
// Permission format: module.resource.action
type Permission =
  | 'volunteers.view'
  | 'volunteers.create'
  | 'volunteers.assign'
  | 'volunteers.roles.manage'
  | 'ticketing.view'
  | 'ticketing.orders.manage'
  | 'finance.view'
  | 'finance.edit'
  | 'settings.tenant.manage'
  | '*'; // Super admin

// DB Schema
roles {
  id: uuid
  tenant_id: uuid
  module_id: string | null  // null = global role
  name: string              // "Chef Bénévoles Accueil"
  description: string
  permissions: string[]     // ['volunteers.view', 'volunteers.assign']
  created_by: uuid          // Module Manager qui a créé
  is_system: boolean        // true pour rôles prédéfinis
}

user_roles {
  user_id: uuid
  role_id: uuid
  tenant_id: uuid
  scope: string | null      // ex: 'module:volunteers'
}
```

### Création Rôles Custom par Module Manager

```typescript
// Module Manager "Bénévoles" crée un rôle custom
async function createCustomRole(
  moduleManagerId: string,
  moduleId: string,
  roleData: {
    name: string,
    permissions: Permission[]
  }
) {
  // Vérifier que permissions sont dans le scope du module
  const allowedPermissions = getModulePermissions(moduleId);
  const isValid = roleData.permissions.every(p =>
    allowedPermissions.includes(p)
  );

  if (!isValid) throw new Error('Permissions hors scope');

  return prisma.role.create({
    data: {
      ...roleData,
      module_id: moduleId,
      created_by: moduleManagerId,
      is_system: false
    }
  });
}
```

### Vérification Permissions

```typescript
// Middleware / Hook
async function checkPermission(
  userId: string,
  tenantId: string,
  permission: Permission
): Promise<boolean> {
  const userRoles = await getUserRoles(userId, tenantId);

  // Super admin bypass
  if (userRoles.some(r => r.permissions.includes('*'))) {
    return true;
  }

  // Check specific permission
  return userRoles.some(r =>
    r.permissions.includes(permission)
  );
}
```

---

## 📦 MODULES PRÉVUS

### 1. Core (Système)
- ✅ Authentication & Users
- ✅ Tenant Management
- ✅ Dashboard
- ✅ Settings
- ✅ Notifications

### 2. Module Bénévoles (MVP - Phase 1)
**Fonctionnalités** :
- Inscription/candidature bénévoles
- Création missions par Module Manager
- Création rôles custom (Accueil, Bar, Sécurité, Logistique...)
- Attribution manuelle bénévoles → missions
- Dashboard bénévole (ses missions, planning)
- Invitations par code 6 lettres

**Schema** :
```sql
volunteers (user_id, tenant_id, status, skills[], availability)
volunteer_missions (id, tenant_id, title, description, required_count, date_range)
volunteer_roles (id, tenant_id, name, permissions[])
volunteer_assignments (volunteer_id, mission_id, role_id, status)
```

### 3. Module Billetterie (Phase 2)
- Types de billets (Early Bird, VIP, Pass journée...)
- Commandes & paiements (Stripe)
- Check-in QR codes
- Statistiques ventes

### 4. Module E-commerce / Merchandising (Phase 2)
- Catalogue produits (t-shirts, goodies...)
- Panier & checkout
- Gestion stock
- Livraison/retrait sur place

### 5. Module Organisation / Planning (Phase 2)
- Programmation événement (scènes, horaires)
- Gestion lieux/espaces
- Planning général
- Cartographie interactive

### 6. Module Communication (Phase 3)
- Emails/SMS en masse
- Newsletters
- Notifications push (PWA)
- Templates personnalisables

### 7. Module Trésorerie / Finance (Phase 3)
- Suivi recettes/dépenses
- Budgets prévisionnels
- Facturation conforme (FR/UE)
- Export comptable
- Intégration Stripe

### 8. Module Accréditations (Phase 3)
- Badges participants/staff/presse
- Zones d'accès
- Contrôle entrées

### 9. Module Cashless (Phase 4)
- Système paiement bracelet/carte
- Recharge crédit
- Remboursement automatique

### 10. Future Modules (Marketplace)
- API ouverte pour développeurs tiers
- Store de modules communautaires
- Revenue sharing

---

## 🚀 MVP - PÉRIMÈTRE INITIAL

### Phase 1 - Core + Module Bénévoles (8-10 semaines)

#### Semaines 1-2 : Setup & Core
- ✅ Init projet Next.js 15 + TypeScript
- ✅ Setup Neon PostgreSQL
- ✅ Auth.js v5 (email/password + Google OAuth)
- ✅ Schema DB multitenant avec RLS
- ✅ Middleware tenant resolution
- ✅ Design system liquid glass (composants de base)

#### Semaines 3-4 : Tenant Management
- ✅ Création tenant (organisateur s'inscrit)
- ✅ Dashboard tenant
- ✅ Settings tenant (nom, logo, dates événement)
- ✅ Invitation membres équipe
- ✅ RBAC de base (Super Admin, Tenant Admin, Member)

#### Semaines 5-7 : Module Bénévoles (MVP features)
- ✅ Modèle de données bénévoles
- ✅ Création missions
- ✅ Création rôles custom par Module Manager
- ✅ Inscription bénévole (formulaire public)
- ✅ Attribution bénévole → mission
- ✅ Dashboard bénévole (liste missions assignées)

#### Semaines 8-10 : Système Invitation + Polish
- ✅ Génération codes 6 lettres uniques
- ✅ Page d'inscription via code
- ✅ Email invitations (Resend)
- ✅ Onboarding flow complet
- ✅ Tests e2e critiques
- ✅ Deployment production

### Critères de Succès MVP
- [ ] Un organisateur peut créer son événement en < 5 min
- [ ] Un organisateur peut créer 3 missions bénévoles
- [ ] Un organisateur peut générer un code d'invitation
- [ ] Un bénévole peut s'inscrire via code en < 3 min
- [ ] Un bénévole voit ses missions dans son dashboard
- [ ] 0 bugs critiques
- [ ] Performance Lighthouse > 90

---

## 💰 MODÈLE DE MONÉTISATION

### Pricing Strategy (Hybrid Model)

#### Free Tier
- **Gratuit jusqu'à** :
  - 1 événement actif
  - 50 bénévoles max
  - 3 modules de base (Core, Bénévoles, Communication basique)
  - Support communautaire (forum)

#### Starter - 29€/mois
- **Inclus** :
  - 3 événements simultanés
  - 200 bénévoles
  - Tous les modules sauf Enterprise
  - Support email (48h)
  - Branding custom (logo, couleurs)

#### Pro - 79€/mois
- **Inclus** :
  - Événements illimités
  - 1000 bénévoles
  - Tous les modules
  - Support prioritaire (24h)
  - Sous-domaine custom (votrefestival.orizon.app)
  - Export données
  - Analytics avancées

#### Enterprise - Sur devis
- **Inclus** :
  - Tout Pro +
  - Bénévoles illimités
  - Domaine custom complet
  - SSO (SAML, OIDC)
  - SLA 99.9%
  - Support dédié + onboarding
  - Développement features custom

### Add-ons (Pay-as-you-go)
- **Bénévoles supplémentaires** : 0.50€/bénévole/mois (au-delà du plan)
- **Module Billetterie** : 2% commission + frais Stripe
- **SMS** : 0.05€/SMS (communication)
- **Stockage** : 5€/10GB (au-delà de 10GB)

### Gestion Abonnements (Super Admin)

```typescript
// Super Admin peut offrir gratuitement
async function grantFreeAccess(
  tenantId: string,
  modules: string[],
  durationDays: number
) {
  await prisma.tenantModule.createMany({
    data: modules.map(moduleId => ({
      tenant_id: tenantId,
      module_id: moduleId,
      enabled: true,
      expires_at: addDays(new Date(), durationDays),
      billing_status: 'granted' // vs 'trial' | 'active' | 'expired'
    }))
  });
}
```

### Stripe Integration

```typescript
// Stripe Connect Standard (pour commissions futures)
const customer = await stripe.customers.create({
  email: tenant.email,
  metadata: { tenant_id: tenant.id }
});

const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ price: 'price_starter_monthly' }],
  metadata: { tenant_id: tenant.id }
});

// Webhooks Stripe
async function handleSubscriptionUpdate(event) {
  const subscription = event.data.object;

  await prisma.tenant.update({
    where: { stripe_subscription_id: subscription.id },
    data: {
      subscription_status: subscription.status,
      plan: subscription.metadata.plan
    }
  });
}
```

---

## 🛠️ STACK TECHNIQUE DÉTAILLÉ

### Frontend Architecture

```
/app                    # Next.js 15 App Router
  /(auth)              # Auth routes (login, signup)
  /(dashboard)         # Protected routes
    /[tenantId]        # Tenant-scoped pages
      /dashboard
      /volunteers
      /settings
  /api                 # API Routes (webhooks)
  /layout.tsx
  /page.tsx

/components
  /ui                  # Shadcn components
  /modules             # Module-specific components
  /layouts             # Layout components

/lib
  /auth.ts             # Auth.js config
  /db.ts               # Prisma client
  /permissions.ts      # RBAC logic
  /modules.ts          # Module loader

/modules               # Module definitions
  /volunteers
    /components
    /actions           # Server Actions
    /schemas           # Zod schemas
    module.config.ts

/styles
  globals.css          # Tailwind + glass effects
```

### Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// CORE MODELS

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  tenantMembers TenantMember[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Tenant {
  id                    String   @id @default(cuid())
  name                  String
  slug                  String   @unique
  description           String?
  logo                  String?
  website               String?
  eventStartDate        DateTime?
  eventEndDate          DateTime?

  // Billing
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  subscriptionStatus    String?  // active, trialing, canceled, etc.
  plan                  String?  // free, starter, pro, enterprise

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  members               TenantMember[]
  modules               TenantModule[]
  inviteCodes           InviteCode[]

  @@map("tenants")
}

model TenantMember {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  role      String   // tenant_admin, module_manager, member

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  joinedAt  DateTime @default(now())

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
  @@map("tenant_members")
}

model TenantModule {
  id             String    @id @default(cuid())
  tenantId       String
  moduleId       String    // 'volunteers', 'ticketing', etc.
  enabled        Boolean   @default(true)
  activatedAt    DateTime  @default(now())
  expiresAt      DateTime? // null = permanent
  billingStatus  String    @default("granted") // granted, trial, active, expired

  tenant         Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, moduleId])
  @@index([tenantId])
  @@map("tenant_modules")
}

model Role {
  id          String   @id @default(cuid())
  tenantId    String
  moduleId    String?  // null = global role
  name        String
  description String?
  permissions String[] // array of permission strings
  isSystem    Boolean  @default(false)
  createdBy   String?
  createdAt   DateTime @default(now())

  assignments UserRole[]

  @@unique([tenantId, moduleId, name])
  @@index([tenantId])
  @@map("roles")
}

model UserRole {
  id       String @id @default(cuid())
  userId   String
  roleId   String
  tenantId String
  scope    String? // 'module:volunteers'

  role     Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  assignedAt DateTime @default(now())

  @@unique([userId, roleId, tenantId])
  @@index([userId])
  @@index([tenantId])
  @@map("user_roles")
}

model InviteCode {
  id        String   @id @default(cuid())
  tenantId  String
  code      String   @unique // 6-letter code
  moduleId  String?  // null = general invite, or specific module
  role      String   // role to assign on signup
  maxUses   Int      @default(1)
  uses      Int      @default(0)
  expiresAt DateTime?
  createdBy String
  createdAt DateTime @default(now())

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([code])
  @@index([tenantId])
  @@map("invite_codes")
}

// MODULE: VOLUNTEERS

model Volunteer {
  id           String   @id @default(cuid())
  tenantId     String
  userId       String   // Reference to User
  status       String   @default("pending") // pending, approved, rejected
  skills       String[]
  availability String?  // JSON or text
  notes        String?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  assignments  VolunteerAssignment[]

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@map("volunteers")
}

model VolunteerMission {
  id              String    @id @default(cuid())
  tenantId        String
  title           String
  description     String?
  requiredCount   Int       @default(1)
  startDate       DateTime?
  endDate         DateTime?
  location        String?
  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  assignments     VolunteerAssignment[]

  @@index([tenantId])
  @@map("volunteer_missions")
}

model VolunteerRole {
  id          String   @id @default(cuid())
  tenantId    String
  name        String
  description String?
  color       String?
  createdBy   String
  createdAt   DateTime @default(now())

  @@unique([tenantId, name])
  @@index([tenantId])
  @@map("volunteer_roles")
}

model VolunteerAssignment {
  id         String   @id @default(cuid())
  tenantId   String
  volunteerId String
  missionId  String
  roleId     String?
  status     String   @default("assigned") // assigned, confirmed, completed, cancelled
  notes      String?
  assignedAt DateTime @default(now())

  volunteer  Volunteer        @relation(fields: [volunteerId], references: [id], onDelete: Cascade)
  mission    VolunteerMission @relation(fields: [missionId], references: [id], onDelete: Cascade)

  @@unique([volunteerId, missionId])
  @@index([tenantId])
  @@map("volunteer_assignments")
}
```

### RLS Policies (SQL)

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see data from their current tenant
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.current_tenant', true)::TEXT);

CREATE POLICY tenant_isolation ON tenant_members
  USING (tenant_id = current_setting('app.current_tenant', true)::TEXT);

CREATE POLICY tenant_isolation ON volunteers
  USING (tenant_id = current_setting('app.current_tenant', true)::TEXT);

-- Super admin bypass (role = 'super_admin')
CREATE POLICY super_admin_bypass ON tenants
  USING (current_setting('app.user_role', true)::TEXT = 'super_admin');
```

---

## 🎨 DESIGN SYSTEM - LIQUID GLASS

### Inspiration
- iOS 15/16 design language
- Glassmorphism (backgrounds translucides)
- Micro-interactions fluides
- Animations subtiles

### Palette Couleurs

```css
/* globals.css */
:root {
  /* Primary - Gradient moderne */
  --primary: 250 84% 54%;       /* Bleu vibrant */
  --primary-foreground: 0 0% 100%;

  /* Glass effects */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);

  /* Backdrop blur */
  --blur-sm: blur(8px);
  --blur-md: blur(16px);
  --blur-lg: blur(24px);
}

.dark {
  --primary: 250 84% 60%;
  --glass-bg: rgba(0, 0, 0, 0.2);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### Composants Clés

#### Glass Card
```tsx
// components/ui/glass-card.tsx
export function GlassCard({ children, className }: Props) {
  return (
    <div className={cn(
      "rounded-2xl",
      "bg-white/10 dark:bg-black/20",
      "backdrop-blur-md",
      "border border-white/20",
      "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
      "transition-all duration-300",
      "hover:bg-white/15 hover:border-white/30",
      className
    )}>
      {children}
    </div>
  );
}
```

#### Animated Button
```tsx
export function Button({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="..."
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

### Animations

```tsx
// Framer Motion variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### Typography
- **Headings** : Inter (weights: 600, 700, 800)
- **Body** : Inter (weights: 400, 500)
- **Monospace** : JetBrains Mono (code, données)

---

## 📨 SYSTÈME D'INVITATIONS (Codes 6 lettres)

### Fonctionnement

#### 1. Génération Code
```typescript
// lib/invite-codes.ts
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // pas de I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function createInviteCode(
  tenantId: string,
  moduleId: string | null,
  role: string,
  maxUses: number = 1,
  expiresAt?: Date
) {
  let code = generateInviteCode();

  // Ensure uniqueness
  while (await prisma.inviteCode.findUnique({ where: { code } })) {
    code = generateInviteCode();
  }

  return prisma.inviteCode.create({
    data: {
      tenantId,
      code,
      moduleId,
      role,
      maxUses,
      expiresAt,
      createdBy: getCurrentUserId()
    }
  });
}
```

#### 2. Utilisation Code

```typescript
// app/(auth)/join/[code]/page.tsx
export default async function JoinPage({ params }: { params: { code: string } }) {
  const invite = await prisma.inviteCode.findUnique({
    where: { code: params.code.toUpperCase() },
    include: { tenant: true }
  });

  if (!invite || invite.uses >= invite.maxUses) {
    return <InvalidInvitePage />;
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return <ExpiredInvitePage />;
  }

  return <SignupForm invite={invite} />;
}

// Server Action
async function acceptInvite(code: string, userData: SignupData) {
  const invite = await validateInviteCode(code);

  // Create user
  const user = await createUser(userData);

  // Add to tenant
  await prisma.tenantMember.create({
    data: {
      tenantId: invite.tenantId,
      userId: user.id,
      role: invite.role
    }
  });

  // Increment uses
  await prisma.inviteCode.update({
    where: { code },
    data: { uses: { increment: 1 } }
  });

  // If module-specific, activate module for user
  if (invite.moduleId) {
    await grantModuleAccess(user.id, invite.tenantId, invite.moduleId);
  }

  return { success: true, tenantId: invite.tenantId };
}
```

#### 3. UX Flow

```
Organisateur → Crée invitation → Obtient code "ABC3X7"
               ↓
Partage code (email, SMS, affiche)
               ↓
Bénévole → Visite orizon.app/join/ABC3X7
          ↓
Voir: "Rejoindre Festival Rock 2026 en tant que Bénévole"
          ↓
S'inscrit (nom, email, mot de passe)
          ↓
Auto-connecté → Redirigé vers dashboard bénévole
```

---

## 📋 ONBOARDING UX

### Parcours Organisateur

#### Étape 1 : Inscription (30 sec)
```tsx
<SignupForm>
  <Input label="Email" />
  <Input label="Nom complet" />
  <Input label="Mot de passe" type="password" />
  <Button>Créer mon compte</Button>
  <Divider />
  <Button variant="outline">
    <GoogleIcon /> Continuer avec Google
  </Button>
</SignupForm>
```

#### Étape 2 : Welcome + Template (1 min)
```tsx
<WelcomeScreen>
  <h1>Bienvenue sur Orizon !</h1>
  <p>Quel type d'événement organisez-vous ?</p>

  <TemplateGrid>
    <TemplateCard
      icon="🎵"
      title="Festival Musique"
      modules={['volunteers', 'ticketing', 'organization']}
    />
    <TemplateCard
      icon="🎤"
      title="Conférence"
      modules={['volunteers', 'speakers', 'accreditation']}
    />
    <TemplateCard
      icon="🎨"
      title="Salon / Expo"
      modules={['volunteers', 'exhibitors', 'logistics']}
    />
    <TemplateCard
      icon="⚙️"
      title="Personnalisé"
      modules={[]}
    />
  </TemplateGrid>
</WelcomeScreen>
```

#### Étape 3 : Créer Premier Événement (1 min)
```tsx
<CreateEventForm>
  <Input label="Nom de l'événement" placeholder="Festival Rock 2026" />
  <DateRangePicker label="Dates" />
  <Input label="Lieu" placeholder="Lyon, France" />
  <TextArea label="Description" optional />
  <Button>Créer mon événement</Button>
</CreateEventForm>
```

#### Étape 4 : Interactive Walkthrough (2 min)
```tsx
<InteractiveTour steps={[
  {
    target: '#dashboard',
    title: 'Votre tableau de bord',
    content: 'Ici vous retrouvez toutes les statistiques de votre événement'
  },
  {
    target: '#modules-nav',
    title: 'Vos modules',
    content: 'Accédez à vos différents outils (bénévoles, billetterie...)'
  },
  {
    target: '#invite-button',
    title: 'Invitez votre équipe',
    content: 'Générez un code pour que vos bénévoles rejoignent la plateforme',
    action: 'Créer mon premier code'
  }
]} />
```

#### Étape 5 : Checklist de Démarrage
```tsx
<OnboardingChecklist>
  ✅ Créer votre événement
  ⬜ Créer 3 missions bénévoles
  ⬜ Inviter 5 bénévoles
  ⬜ Personnaliser votre branding
  ⬜ Activer la billetterie
</OnboardingChecklist>
```

### Parcours Bénévole

#### Via Code d'Invitation
```
1. Clic sur lien → orizon.app/join/ABC3X7
2. Page : "Rejoindre [Festival Rock 2026]"
   - Logo événement
   - "Vous avez été invité à rejoindre l'équipe bénévole"
3. Formulaire inscription simplifié :
   - Prénom + Nom
   - Email
   - Mot de passe
   - [Auto-rempli: rôle = bénévole]
4. Inscription → Auto-login → Dashboard bénévole
5. Voir ses missions assignées (ou message "En attente d'affectation")
```

---

## 📈 ROADMAP DE DÉVELOPPEMENT

### Phase 1 : MVP (Semaines 1-10) - Q1 2026

**Objectif** : Plateforme fonctionnelle avec module bénévoles

- ✅ Setup projet complet
- ✅ Auth & multitenant
- ✅ RBAC de base
- ✅ Module bénévoles (3 features)
- ✅ Système d'invitations
- ✅ Design liquid glass
- ✅ Onboarding
- ✅ Deployment Vercel

**Livrables** :
- App en production sur orizon.app
- 10 bêta-testeurs (festivals locaux)

### Phase 2 : Modules Essentiels (Semaines 11-20) - Q2 2026

**Objectif** : Ajout billetterie + communication

- ✅ Module Billetterie
  - Types billets
  - Paiements Stripe
  - QR codes
- ✅ Module Communication
  - Emails en masse (Resend)
  - Templates
  - Notifications
- ✅ Dashboard analytics avancé
- ✅ Export données (CSV, PDF)
- ✅ Tests automatisés (Playwright)

**Livrables** :
- 50 utilisateurs payants
- 5 festivals utilisant billetterie

### Phase 3 : Scale & Monétisation (Semaines 21-30) - Q3 2026

**Objectif** : Croissance et revenus

- ✅ Stripe billing automatisé
- ✅ Module Organisation/Planning
- ✅ Module Trésorerie
- ✅ Sous-domaines custom
- ✅ SSO (Google Workspace, Azure AD)
- ✅ API publique v1
- ✅ Documentation développeurs

**Livrables** :
- 200 tenants actifs
- 10k€ MRR (Monthly Recurring Revenue)

### Phase 4 : Intelligence & Marketplace (Semaines 31-40) - Q4 2026

**Objectif** : IA et écosystème

- ✅ MCP Server pour contrôle IA
- ✅ Assistant IA conversationnel
- ✅ Recommandations automatiques
- ✅ Marketplace modules tiers
- ✅ Revenue sharing développeurs
- ✅ Modules avancés (Cashless, Accréditations)

**Livrables** :
- 500 tenants actifs
- 50k€ MRR
- 10 modules tiers dans marketplace

### Phase 5 : Enterprise & International (2027)

- ✅ Multi-langues (EN, ES, DE)
- ✅ Conformité internationale (CCPA, etc.)
- ✅ Features Enterprise (SLA, support dédié)
- ✅ Mobile apps natives (iOS/Android)
- ✅ Intégrations avancées (Salesforce, HubSpot...)

---

## ⚖️ ASPECTS LÉGAUX & JURIDIQUES

### Statut Juridique Recommandé

#### Pour Votre Fils (Apprenti) - Phase de Lancement

**Option 1 : Micro-Entreprise (Recommandé pour démarrer)**

**Avantages** :
- ✅ Création gratuite et ultra-simple en ligne
- ✅ Pas de capital requis
- ✅ Comptabilité simplifiée (livre des recettes)
- ✅ Charges sociales légères : 22% du CA
- ✅ Possibilité ACRE (réduction charges 1ère année)
- ✅ Compatible avec statut apprenti

**Limites** :
- ❌ Plafond CA : 77,700€/an (prestations services)
- ❌ Pas de déduction charges réelles
- ❌ Moins "pro" pour investisseurs

**À faire** :
1. Créer micro-entreprise sur guichet-entreprises.fr
2. Choisir activité : "Édition de logiciels applicatifs" (Code APE 5829C)
3. Déclarer CA mensuellement ou trimestriellement
4. Ouvrir compte bancaire dédié (obligatoire si CA > 10k€)

#### Pour Vous (Fonctionnaire) - Si Vous Souhaitez Être Impliqué

**Contraintes légales** :
- ⚠️ Fonctionnaire = **interdiction d'exercer activité privée lucrative**
- Exceptions :
  - Activité accessoire (avec autorisation hiérarchique)
  - Temps partiel + cumul autorisé
  - **Congé pour création d'entreprise** (1 an renouvelable 1x)

**Option A : Congé Création Entreprise**
- Vous suspendez votre poste 1 an
- Vous créez et gérez l'entreprise
- Pas de salaire EN, mais revenus entreprise
- Si échec, réintégration garantie

**Option B : Être Associé Passif en SASU (avec votre fils gérant)**
- Vous pouvez détenir des actions SANS gérer
- Votre fils = président (gérant actif)
- Vous = simple actionnaire (passif)
- ✅ Autorisé sans autorisation EN

**Recommandation** :
```
Phase 1 (2026) :
  Votre fils crée micro-entreprise (gérant unique)
  Vous = conseiller officieux (aucun rôle officiel)

Phase 2 (2027, si CA > 50k€) :
  Transformation en SASU
  Votre fils = Président (gérant)
  Vous = Actionnaire minoritaire (20%) [Autorisé car passif]

Phase 3 (2028+, si levée de fonds) :
  Vous prenez congé création entreprise
  Transformation SAS multi-associés
  Vous devenez co-gérant actif
```

### Conformité Légale (France/UE)

#### RGPD (Obligatoire)
- ✅ Politique de confidentialité
- ✅ Cookies consent banner
- ✅ Droit accès/suppression données
- ✅ DPO si > 250 employés (pas concerné phase 1)
- ✅ Registre des traitements

**À implémenter** :
```tsx
// Cookie consent (react-cookie-consent)
<CookieConsent
  location="bottom"
  buttonText="Accepter"
  declineButtonText="Refuser"
  enableDeclineButton
  onAccept={() => initAnalytics()}
>
  Nous utilisons des cookies pour améliorer votre expérience.
</CookieConsent>

// Privacy page
/privacy → Politique de confidentialité complète
/terms → CGU / CGV
```

#### Facturation Conforme

**Mentions obligatoires factures** :
- Numéro séquentiel unique
- Date émission
- Identité vendeur (SIRET, adresse)
- Identité client
- Détail prestations
- Montant HT, TVA (20%), TTC
- Mentions légales ("TVA non applicable, art. 293 B du CGI" si micro)

**Outils** :
- Stripe Tax (calcul auto TVA UE)
- Génération PDF factures (react-pdf ou API Stripe)

```typescript
// Invoice generation
import { generateInvoicePDF } from '@/lib/invoices';

async function createInvoice(subscription: Subscription) {
  const invoice = await prisma.invoice.create({
    data: {
      number: await getNextInvoiceNumber(),
      tenantId: subscription.tenantId,
      amount: subscription.amount,
      tax: subscription.amount * 0.20,
      status: 'paid',
      pdfUrl: null
    }
  });

  // Generate PDF
  const pdf = await generateInvoicePDF(invoice);
  const url = await uploadToR2(pdf, `invoices/${invoice.number}.pdf`);

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { pdfUrl: url }
  });

  // Send email
  await sendInvoiceEmail(invoice);
}
```

#### CGU / CGV

**Contenu minimum** :
- Objet du service
- Conditions d'accès
- Tarifs et facturation
- Propriété intellectuelle
- Données personnelles
- Responsabilités / Garanties
- Résiliation
- Droit applicable (France) et juridiction

**Génération** :
- Utiliser templates légaux (ex: legalstart.fr)
- Faire relire par avocat spécialisé SaaS (500-1000€)

---

## 🔮 FEATURES FUTURES (Phase 2+)

### IA & Automation

#### Assistant Conversationnel
```tsx
// Chat widget dans dashboard
<AIAssistant>
  User: "Crée-moi 5 missions pour un festival de 3 jours"
  AI: "Voici 5 missions générées :
       1. Accueil & Information (15 bénévoles, J1-J3)
       2. Sécurité & Contrôle (10 bénévoles, J1-J3)
       ..."
  [Bouton: Créer ces missions]
</AIAssistant>
```

#### MCP Server
```typescript
// tools/festival-management.ts
export const festivalMCP = {
  name: 'orizon-festival-manager',
  description: 'Manage festival operations via AI',

  tools: [
    {
      name: 'create_volunteer_mission',
      description: 'Create a new volunteer mission',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          requiredCount: { type: 'number' },
          dates: { type: 'array' }
        }
      },
      handler: async (input) => {
        return await createMission(input);
      }
    },
    {
      name: 'generate_report',
      description: 'Generate analytics report',
      // ...
    }
  ]
};
```

#### Smart Recommendations
- Suggestion missions basées sur événements similaires
- Prédiction affluence (ML sur historique)
- Optimisation planning automatique

### Marketplace Modules

#### Developer Portal
```
/developers
  /docs        → API documentation
  /modules     → Browse modules
  /dashboard   → Dev account (API keys, stats)
  /publish     → Publish new module
```

#### Module Submission
```typescript
// Module tiers structure
{
  id: 'premium-accreditation',
  author: 'acme-corp',
  name: 'Accréditation Premium',
  description: '...',
  price: 15, // €/mois
  revenueShare: 0.70, // 70% dev, 30% Orizon

  // Module package
  package: '@acme/orizon-accreditation',
  version: '1.2.0',

  // Permissions required
  permissions: ['users.read', 'events.read'],

  // Certified by Orizon
  verified: true
}
```

### Intégrations Externes

- **Zapier** : Connecter à 5000+ apps
- **Slack** : Notifications équipe
- **Google Calendar** : Sync planning
- **Mailchimp** : Sync contacts
- **Stripe Connect** : Paiements exposants/vendeurs
- **Twilio** : SMS avancés
- **Google Maps** : Cartographie interactive

### Features Avancées

#### Multi-Events
- Organisateur gère plusieurs événements simultanés
- Dashboard cross-events
- Partage ressources (bénévoles récurrents)

#### White Label
- Domaine custom complet (votrefestival.com)
- Branding total (couleurs, fonts, logo)
- Suppression marque Orizon (plan Enterprise)

#### Mobile Apps Natives
- iOS / Android
- Notifications push natives
- Mode offline
- Scan QR codes (billetterie, accréditations)

---

## 📚 SOURCES & RÉFÉRENCES

### Recherches Effectuées

**Concurrence & Pricing** :
- [33 Best SaaS events and conferences 2026](https://saas.group/events/)
- [Best Festival Management Software for Cloud of 2025](https://sourceforge.net/software/festival-management/saas/)
- [SaaS Pricing Models: Types, Benefits & How to Choose](https://www.spendflo.com/blog/the-ultimate-guide-to-saas-pricing-models)
- [Volunteer Management Software List](https://www.saasworthy.com/list/volunteer-management)

**Onboarding Best Practices** :
- [SaaS onboarding best practices for 2025 | ProductLed](https://productled.com/blog/5-best-practices-for-better-saas-user-onboarding)
- [Best SaaS Onboarding Examples, Checklist & Practices | Candu](https://www.candu.ai/blog/best-saas-onboarding-examples-checklist-practices-for-2025)
- [8 SaaS Companies Have The Best Onboarding Experience](https://userpilot.com/blog/best-user-onboarding-experience/)
- [Guide for SaaS onboarding. Best practices for 2025](https://www.insaim.design/blog/saas-onboarding-best-practices-for-2025-examples)

**Statut Juridique France** :
- [Micro-entreprise, SASU, EURL : quel statut choisir ?](https://www.c-g-h.net/creation-entreprise/choisir-statut-juridique/)
- [Un fonctionnaire peut-il créer ou reprendre une entreprise ?](https://www.lecoindesentrepreneurs.fr/fonctionnaire-associe-createur-ou-repreneur-dentreprise/)
- [SASU et micro-entreprise : quel statut choisir en 2025](https://www.legalplace.fr/guides/regimes-sasu-micro-entreprise/)
- [Micro-entreprise : ce qui change en 2025](https://www.lecoindesentrepreneurs.fr/micro-entreprise-changements-2025/)

**Architecture Multitenant** :
- [Multi-tenant data isolation with PostgreSQL RLS | AWS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)
- [Shipping multi-tenant SaaS using Postgres RLS](https://www.thenile.dev/blog/multi-tenant-rls)
- [Mastering PostgreSQL RLS for Multi-Tenancy](https://ricofritzsche.me/mastering-postgresql-row-level-security-rls-for-rock-solid-multi-tenancy/)
- [Postgres RLS Implementation Guide - Best Practices](https://www.permit.io/blog/postgres-rls-implementation-guide)

---

## ✅ PROCHAINES ÉTAPES

### Actions Immédiates

1. **Validation de cette spec** par vous
2. **Choix statut juridique** : votre fils crée micro-entreprise ?
3. **Création comptes** :
   - GitHub repo
   - Vercel account
   - Neon database
   - Stripe account (mode test)
4. **Initialisation projet** (commande suivante)

### Commande de Démarrage

Une fois validé, je lance :

```bash
# Init Next.js 15 + TypeScript
pnpm create next-app@latest orizon --typescript --tailwind --app --src-dir

# Install dependencies
pnpm add @prisma/client @auth/prisma-adapter next-auth@beta
pnpm add -D prisma

# Setup Prisma
pnpm prisma init

# Install UI components
pnpx shadcn-ui@latest init
```

---

**Ce document servira de référence unique pour tout le développement.**

**Version** : 1.0.0
**Dernière mise à jour** : 2026-01-01
**Auteur** : Claude (Sonnet 4.5) + Vous
**Statut** : ✅ Prêt pour validation

---

**PRÊT À DÉMARRER LE DÉVELOPPEMENT ?** 🚀
