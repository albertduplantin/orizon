# ORIZON 🎪

> Plateforme SaaS multitenant hypermoderne de gestion d'événements et festivals

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-RLS-336791)](https://www.postgresql.org/)

---

## 🎯 Vision

ORIZON permet aux organisateurs de festivals, événements et salons de **centraliser toute leur gestion** via une plateforme modulaire, moderne et scalable.

Fini les outils disparates (Excel, emails, apps multiples) → **tout-en-un intelligent**.

---

## ✨ Fonctionnalités Clés (MVP)

### 🏢 Multitenant
- Chaque événement/festival = tenant isolé et sécurisé
- Row-Level Security PostgreSQL native
- Utilisateurs peuvent gérer plusieurs événements

### 🧩 Architecture Modulaire
- Modules activables à la demande (plugins)
- **MVP**: Module Gestion Bénévoles
- Roadmap: Billetterie, E-commerce, Communication, Trésorerie...

### 👥 RBAC Avancé
- Super Admin, Tenant Admin, Module Manager, Bénévole, Participant
- Création de rôles custom par Module Manager
- Permissions granulaires par module

### 📨 Invitations par Code
- Codes 6 lettres uniques (ex: `ABC3X7`)
- Lien direct: `orizon.app/join/ABC3X7`
- Inscription automatique au bon tenant/module

### 🎨 Design Liquid Glass
- Glassmorphism iOS-like
- Animations fluides (Framer Motion)
- PWA (Progressive Web App)
- Dark mode natif

---

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Langage**: TypeScript (strict mode)
- **UI**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js (Next.js Server Actions + API Routes)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: Auth.js v5 (NextAuth)
- **Multitenant**: Row-Level Security (RLS)

### Infrastructure
- **Hosting**: Vercel
- **Database**: Neon Postgres
- **Storage**: Cloudflare R2
- **Email**: Resend
- **Payments**: Stripe
- **Analytics**: Vercel Analytics
- **Monitoring**: Sentry

---

## 📁 Structure du Projet

```
orizon/
├── .claude/
│   └── chat-context.md          # Contexte conversation Claude
├── app/
│   ├── (auth)/                  # Routes authentification
│   ├── (dashboard)/             # Routes protégées
│   │   └── [tenantId]/          # Routes scoped par tenant
│   ├── api/                     # API Routes (webhooks)
│   └── layout.tsx
├── components/
│   ├── ui/                      # Composants Shadcn
│   ├── modules/                 # Composants modules
│   └── layouts/
├── lib/
│   ├── auth.ts                  # Config Auth.js
│   ├── db.ts                    # Prisma client
│   ├── permissions.ts           # Logique RBAC
│   └── modules.ts               # Module loader
├── modules/                     # Définitions modules
│   ├── volunteers/              # Module Bénévoles
│   │   ├── components/
│   │   ├── actions/             # Server Actions
│   │   └── module.config.ts
│   └── [autres-modules]/
├── prisma/
│   └── schema.prisma            # Schéma DB
├── PROJECT_SPEC.md              # 📘 Spécification complète
└── README.md                    # Ce fichier
```

---

## 🚀 Getting Started

### Prérequis
- Node.js 20+
- pnpm (recommandé) ou npm
- Compte Neon (PostgreSQL gratuit)
- Compte Vercel (déploiement gratuit)

### Installation

```bash
# Cloner le repo
git clone https://github.com/votre-username/orizon.git
cd orizon

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials

# Setup Prisma
pnpm prisma generate
pnpm prisma db push

# Lancer en dev
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Variables d'Environnement

```env
# Database (Neon)
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
```

---

## 📚 Documentation

- **[PROJECT_SPEC.md](./PROJECT_SPEC.md)** → Spécification technique complète
- **[.claude/chat-context.md](./.claude/chat-context.md)** → Contexte conversation de design

### Prisma

```bash
# Générer le client Prisma
pnpm prisma generate

# Créer une migration
pnpm prisma migrate dev --name init

# Ouvrir Prisma Studio
pnpm prisma studio
```

### Développement

```bash
# Dev server avec hot reload
pnpm dev

# Build production
pnpm build

# Lancer build en local
pnpm start

# Linting
pnpm lint

# Type checking
pnpm type-check
```

---

## 🗺️ Roadmap

### ✅ Phase 1 - MVP (Q1 2026) - 10 semaines
- [x] Setup projet Next.js 15 + TypeScript
- [ ] Auth.js v5 (email + Google OAuth)
- [ ] Système multitenant avec RLS
- [ ] RBAC de base
- [ ] Module Bénévoles (MVP features)
- [ ] Système invitations codes 6 lettres
- [ ] Design liquid glass (composants base)
- [ ] Déploiement Vercel

**Objectif**: 10 bêta-testeurs

### 🔄 Phase 2 - Modules Essentiels (Q2 2026)
- [ ] Module Billetterie + Stripe
- [ ] Module Communication (emails en masse)
- [ ] Dashboard analytics avancé
- [ ] Export données (CSV, PDF)
- [ ] Tests e2e (Playwright)

**Objectif**: 50 utilisateurs payants

### 🔄 Phase 3 - Scale & Monétisation (Q3 2026)
- [ ] Stripe billing automatisé
- [ ] Module Organisation/Planning
- [ ] Module Trésorerie
- [ ] Sous-domaines custom
- [ ] API publique v1

**Objectif**: 10k€ MRR

### 🔮 Phase 4 - IA & Marketplace (Q4 2026)
- [ ] MCP Server (contrôle IA)
- [ ] Assistant IA conversationnel
- [ ] Marketplace modules tiers
- [ ] Modules Cashless + Accréditations

**Objectif**: 50k€ MRR

---

## 💰 Pricing

### Free Tier
- 1 événement actif
- 50 bénévoles max
- 3 modules de base

### Starter - 29€/mois
- 3 événements simultanés
- 200 bénévoles
- Tous les modules sauf Enterprise
- Support email

### Pro - 79€/mois
- Événements illimités
- 1000 bénévoles
- Tous les modules
- Sous-domaine custom
- Support prioritaire

### Enterprise - Sur devis
- Bénévoles illimités
- Domaine custom complet
- SSO (SAML, OIDC)
- SLA 99.9%
- Support dédié

---

## 🤝 Contributing

Ce projet est en développement actif. Les contributions seront ouvertes après la phase MVP.

Pour l'instant, si vous souhaitez participer au bêta-test, contactez-nous.

---

## 📄 Licence

Propriétaire - Tous droits réservés (pour l'instant)

---

## 👨‍💻 Auteurs

- **Fondateur** - Votre nom
- **Développement** - Votre fils (apprenti)
- **Architecture** - Conçu avec Claude (Anthropic)

---

## 🙏 Remerciements

- Next.js team pour l'excellent framework
- Vercel pour l'hosting gratuit au départ
- Shadcn pour les composants UI
- Communauté open-source

---

## 📞 Contact

- **Email**: contact@orizon.app (à créer)
- **Website**: https://orizon.app (à venir)
- **Twitter**: @orizon_app (à créer)

---

**Built with ❤️ in France** 🇫🇷

*Transformons la gestion d'événements* ✨
