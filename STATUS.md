# ORIZON - État du Projet

**Dernière mise à jour**: 2026-01-08

## 🎯 Vue d'ensemble

ORIZON est une plateforme modulaire PWA de gestion d'événements avec système de clearance Rainbow (7 niveaux). Le projet est actuellement en **Phase 3** avec les Phases 1 et 2 complètes.

---

## ✅ Fonctionnalités Complètes

### Phase 1 : Fondations
- **Architecture technique**
  - Next.js 16 avec App Router et Turbopack
  - Authentification Clerk complète
  - PostgreSQL (Neon) avec Drizzle ORM
  - Système multi-tenant fonctionnel
  - Design "liquid glass" Apple-style

- **Système Rainbow Clearance** (7 niveaux)
  - 0 INFRARED: Public
  - 1 RED: Participant
  - 2 ORANGE: Bénévole
  - 3 YELLOW: Coordinateur
  - 4 GREEN: Responsable Module
  - 5 BLUE: Admin Tenant
  - 6 ULTRAVIOLET: Super Admin

- **Administration**
  - Dashboard super admin complet
  - Gestion CRUD des tenants/événements
  - Gestion des membres et clearances
  - Gestion des modules par tenant
  - Pages tarification et paramètres

- **Modules fonctionnels**
  - Communication (temps réel avec Supabase)
  - Gestion des bénévoles
  - Système d'invitations par code

### Phase 2 : Architecture Modulaire PWA
- **Progressive Web App**
  - Manifest.json configuré
  - Service worker avec stratégies de cache
  - Métadonnées iOS et Android
  - Installation sur mobile/desktop

- **Système modulaire**
  - Communication restructurée comme Core module
  - Code splitting avec dynamic imports
  - 6 modules avec placeholders:
    - Communication (Core, Clearance RED/1)
    - Volunteers (Clearance ORANGE/2)
    - Ticketing (Premium, Clearance RED/1)
    - Schedule (Clearance ORANGE/2)
    - Documents (Clearance ORANGE/2)
    - Analytics (Premium, Clearance GREEN/4)

- **Filtrage par clearance**
  - ModulesGrid avec contrôle d'accès
  - Badges de clearance requise
  - Messages "Clearance insuffisante"
  - Routes dynamiquement filtrées

- **Communication Module Enhanced**
  - 🤖 AI-powered message enhancement (Claude API)
    - Améliorer (rendre plus clair/professionnel)
    - Raccourcir (garder l'essentiel)
    - Traduire (vers anglais)
  - 📢 Channel Management
    - Création de channels (Public/Private/Broadcast)
    - Auto-génération de slugs
    - Permissions admin
  - ✨ UI/UX amélioré
    - Dual-button input (AI + Send)
    - Dropdown menu options IA
    - Compteur de caractères
    - États de chargement

---

## 🚧 En Cours

### Phase 3 : Expérience Mobile Optimale
Prochaines étapes:
- Module selection à l'onboarding
- Optimisation UI mobile
- Gestion offline avancée
- Tests PWA sur appareils réels

---

## 📊 Statistiques Techniques

### Build Status
- ✅ TypeScript compilation: PASS
- ✅ Build production: SUCCESS
- ✅ Routes générées: 23/23
- ⚠️ Lighthouse score: À mesurer

### Dépendances Clés
```json
{
  "@clerk/nextjs": "^6.x",
  "drizzle-orm": "^0.x",
  "@supabase/supabase-js": "^2.x",
  "@anthropic-ai/sdk": "^0.x",
  "next": "16.1.1",
  "next-pwa": "^5.x"
}
```

### Structure du Projet
```
orizon/
├── src/
│   ├── app/                    # Pages et API routes
│   ├── components/             # Composants réutilisables
│   │   ├── admin/             # Admin-only components
│   │   ├── communication/     # Chat components
│   │   ├── dashboard/         # Dashboard components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                    # Utilitaires et logique
│   │   ├── modules.ts         # Module system
│   │   ├── dynamic-modules.ts # Code splitting
│   │   ├── clearance.ts       # Rainbow Clearance
│   │   └── permissions.ts     # RBAC + Clearance
│   ├── modules/               # Module placeholders
│   │   ├── communication/
│   │   ├── volunteers/
│   │   ├── ticketing/
│   │   ├── schedule/
│   │   ├── documents/
│   │   └── analytics/
│   └── db/                    # Drizzle schema
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
└── drizzle/                   # Migrations
```

---

## 🔑 Configuration Requise

### Variables d'Environnement
```bash
# Database
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=...

# Supabase (Real-time)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Anthropic API (AI Enhancement)
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 🎨 Design System

### Couleurs
- Primary: `#6366f1` (Indigo)
- Glass effect: `bg-white/50`, `backdrop-blur-sm`
- Gradient: `from-blue-50 via-white to-purple-50`

### Composants UI
- shadcn/ui pour composants de base
- Custom glass-card styling
- Clearance badges avec couleurs Rainbow
- Module cards avec hover effects

---

## 🔐 Sécurité

### Authentification & Autorisation
- Clerk pour auth utilisateur
- RBAC: super_admin, tenant_admin, member
- Rainbow Clearance: 7 niveaux (0-6)
- Permissions granulaires par ressource

### API Protection
- `requireSuperAdmin()` pour endpoints admin
- `isSuperAdmin()` pour vérification async
- Validation des permissions par route
- Clearance check sur modules

---

## 📝 Prochaines Étapes

### Priorité 1 (Phase 3)
1. Module selection flow à l'onboarding
2. Optimisation mobile du Communication module
3. Tests PWA installation sur iOS/Android
4. Génération d'icônes PWA réelles

### Priorité 2 (Phase 4)
1. Resource-level clearance implementation
2. Channel clearance filtering
3. Advanced permissions UI

### Backlog
- Offline mode complet
- Background sync
- Push notifications
- Lighthouse optimization (score > 90)

---

## 🐛 Issues Connus

### Warnings (Non-bloquants)
- Next.js 16: `middleware` → `proxy` deprecation warning
- Metadata: `themeColor`/`viewport` should move to `viewport` export
- PWA icons: Placeholders, need real icons generation

### À Corriger
- [ ] Générer vraies icônes PWA (192x192, 512x512)
- [ ] Migrer middleware vers proxy
- [ ] Migrer metadata vers viewport export

---

## 📚 Documentation

### Fichiers Clés
- [ROADMAP.md](./ROADMAP.md) - Roadmap détaillée du projet
- [STATUS.md](./STATUS.md) - Ce fichier
- README.md - À créer

### API Documentation
- `/api/admin/*` - Admin endpoints (super admin only)
- `/api/communication/*` - Communication module
- `/api/communication/ai/enhance` - Claude AI enhancement
- `/api/tenants/*` - Tenant management
- `/api/invite-codes/*` - Invitation system

---

## 🚀 Déploiement

### Build Command
```bash
npm run build  # Includes drizzle-kit push
```

### Environnements
- **Development**: `npm run dev`
- **Production**: Next.js optimized build

### Hébergement Recommandé
- **Frontend**: Vercel (optimisé Next.js)
- **Database**: Neon PostgreSQL (actuel)
- **Real-time**: Supabase (actuel)

---

## 👥 Contribution

### Git Flow
```bash
# Commits suivent le format conventional commits
feat: Add new feature
fix: Fix bug
docs: Update documentation
refactor: Code refactoring
test: Add tests
```

### Branches
- `main` - Production-ready code
- Feature branches si nécessaire

---

**Généré avec Claude Code** 🤖
