# ORIZON - Roadmap de Développement

## 🎯 Vision Globale

ORIZON est une plateforme modulaire de gestion d'événements avec une architecture PWA permettant aux utilisateurs de télécharger uniquement les modules dont ils ont besoin. Le système utilise Rainbow Clearance, un système d'accréditation à 7 niveaux inspiré des systèmes de sécurité militaires.

---

## ✅ Phase 1 : Fondations (COMPLÉTÉ)

### Base Technique
- ✅ Next.js 15 avec App Router
- ✅ Authentification Clerk
- ✅ Base de données PostgreSQL (Neon) avec Drizzle ORM
- ✅ Système multi-tenant
- ✅ Design liquid glass Apple-style

### Modules Fonctionnels
- ✅ Communication en temps réel (WebSocket)
- ✅ Gestion des bénévoles avec invitations
- ✅ Tableau de bord utilisateur
- ✅ Onboarding des nouveaux utilisateurs

### Administration
- ✅ Dashboard super admin
- ✅ Gestion des tenants (CRUD)
- ✅ Page de tarification (lecture seule)
- ✅ Page des paramètres globaux
- ✅ Gestion des modules par tenant

### Sécurité
- ✅ **Système Rainbow Clearance** (7 niveaux)
  - 0 INFRARED: Public
  - 1 RED: Participant
  - 2 ORANGE: Bénévole
  - 3 YELLOW: Coordinateur
  - 4 GREEN: Responsable Module
  - 5 BLUE: Admin Tenant
  - 6 ULTRAVIOLET: Super Admin
- ✅ Gestion des niveaux de clearance par utilisateur
- ✅ Table `resource_clearance` pour contrôle d'accès granulaire
- ✅ Intégration avec système RBAC existant
- ✅ Interface admin pour assigner les clearances

### Validations & Qualité
- ✅ Validation des plages de dates
- ✅ Validation des longueurs de champs
- ✅ Dialogues de confirmation pour actions destructives
- ✅ Sécurisation des endpoints de debug

---

## 🚀 Phase 2 : Architecture Modulaire PWA (EN COURS)

### 2.1 Progressive Web App (PWA)
**Objectif**: Permettre l'installation de l'application sur mobile/desktop

- [ ] **Configuration PWA de base**
  - [ ] Créer `manifest.json` avec métadonnées
  - [ ] Configurer icônes adaptatives (192x192, 512x512)
  - [ ] Définir couleurs de thème et splash screen
  - [ ] Ajouter balises meta pour iOS

- [ ] **Service Worker**
  - [ ] Implémenter stratégie de cache (Network First pour API, Cache First pour assets)
  - [ ] Gérer mode offline avec fallback
  - [ ] Pré-cacher les ressources critiques
  - [ ] Synchronisation en arrière-plan

- [ ] **Optimisations PWA**
  - [ ] Lazy loading des images
  - [ ] Code splitting par route
  - [ ] Optimisation du bundle size
  - [ ] Lighthouse score > 90

**Fichiers à créer**:
- `public/manifest.json`
- `public/sw.js` ou utiliser `next-pwa`
- Configuration dans `next.config.js`

---

### 2.2 Communication comme Couche Core
**Objectif**: La communication ne doit PAS être un module optionnel mais une couche transversale

**Restructuration nécessaire**:

```
Structure actuelle:
├─ Modules (optionnels)
   ├─ Communication ❌
   ├─ Volunteers
   ├─ Ticketing

Structure cible:
├─ Core (toujours chargé)
│  ├─ Auth / User
│  ├─ Communication ✅ (channels, messages, notifications)
│  └─ Realtime (WebSocket)
└─ Modules optionnels
   ├─ Volunteers (peut créer channels "Missions")
   ├─ Ticketing (peut créer channels "Support")
   └─ Schedule (peut créer channels "Planning")
```

**Actions**:
- [ ] Retirer "communication" de `AVAILABLE_MODULES` dans `src/lib/modules.ts`
- [ ] Toujours activer Communication pour tous les tenants
- [ ] Permettre aux modules d'ajouter leurs propres types de channels
- [ ] Créer une API pour les modules : `registerChannelType(moduleId, channelTypeConfig)`
- [ ] Mettre à jour la navigation pour toujours afficher Communication

**Fichiers à modifier**:
- `src/lib/modules.ts`
- `src/components/admin/modules-manager.tsx`
- `src/app/dashboard/[tenantSlug]/layout.tsx`

---

### 2.3 Code Splitting et Chargement Dynamique
**Objectif**: Ne charger que les modules activés pour l'utilisateur

**Implémentation**:

```typescript
// src/lib/dynamic-modules.ts
export const MODULE_LOADERS = {
  volunteers: () => import('@/modules/volunteers'),
  ticketing: () => import('@/modules/ticketing'),
  schedule: () => import('@/modules/schedule'),
  documents: () => import('@/modules/documents'),
};

// Charger uniquement les modules de l'utilisateur
export async function loadUserModules(tenantId: string, userId: string) {
  const userModules = await getUserActiveModules(tenantId, userId);
  return Promise.all(
    userModules.map(m => MODULE_LOADERS[m.id]?.())
  );
}
```

**Actions**:
- [ ] Créer `src/lib/dynamic-modules.ts`
- [ ] Refactoriser modules en dossiers séparés
- [ ] Utiliser `React.lazy()` et `Suspense` pour le chargement
- [ ] Créer une fonction `getUserActiveModules(tenantId, userId)`
- [ ] Intégrer le clearance level dans le filtrage des modules
- [ ] Ajouter des skeletons pour les états de chargement

**Structure cible des modules**:
```
src/modules/
├─ volunteers/
│  ├─ index.ts (export par défaut)
│  ├─ components/
│  ├─ api/
│  └─ types.ts
├─ ticketing/
└─ schedule/
```

---

### 2.4 Intégration Clearance avec Modules
**Objectif**: Filtrer les modules affichés selon le niveau de clearance

**Logique**:
```typescript
// Un bénévole (ORANGE-2) ne voit que:
- Communication (toujours visible)
- Volunteers (si clearance >= 2)

// Un coordinateur (YELLOW-3) voit aussi:
- Schedule
- Team Management

// Un responsable (GREEN-4) voit en plus:
- Analytics
- Budget
```

**Actions**:
- [ ] Ajouter `requiredClearance` à `ModuleDefinition`
- [ ] Filtrer modules dans `getActiveModules()` selon clearance utilisateur
- [ ] Cacher automatiquement les routes des modules non accessibles
- [ ] Afficher badge de clearance requise sur modules verrouillés

**Fichiers à modifier**:
- `src/lib/modules.ts` - Ajouter champ `requiredClearance`
- `src/lib/clearance.ts` - Ajouter `getModuleClearance()`
- `src/app/dashboard/[tenantSlug]/layout.tsx` - Filtrage dynamique

---

## 📱 Phase 3 : Expérience Mobile Optimale

### 3.1 Sélection de Modules à l'Installation
**Flow utilisateur**:
1. Utilisateur reçoit code d'invitation avec rôle prédéfini
2. Code détermine le clearance level initial
3. Au premier login, l'utilisateur voit les modules disponibles selon son clearance
4. Modules pré-cochés selon son rôle (personnalisable)
5. Téléchargement des modules sélectionnés

**Actions**:
- [ ] Créer page `/onboarding/modules` après premier login
- [ ] Mapper codes d'invitation → clearance level
- [ ] Interface de sélection de modules avec prévisualisation
- [ ] Stocker préférences utilisateur dans `user_preferences` table
- [ ] Téléchargement progressif avec barre de progression

### 3.2 Gestion des Notifications par Module
**Objectif**: Notifications uniquement pour les modules activés

**Actions**:
- [ ] Créer table `notification_preferences`
- [ ] Permettre désactivation par module et par type
- [ ] Filtrer notifications selon clearance et modules actifs
- [ ] Push notifications natives via PWA

**Schema**:
```typescript
notification_preferences {
  userId, tenantId, moduleId,
  enablePush, enableEmail, enableInApp,
  mutedUntil
}
```

### 3.3 Mode Offline & Synchronisation
**Actions**:
- [ ] IndexedDB pour cache local des données
- [ ] Queue de synchronisation pour actions offline
- [ ] Indicateur visuel du statut de connexion
- [ ] Conflits de synchronisation : last-write-wins ou merge

---

## 🔐 Phase 4 : Clearance Avancée

### 4.1 Clearance par Ressource
**Utiliser la table `resource_clearance` existante**

**Exemples d'usage**:
```typescript
// Channel privé pour coordinateurs uniquement
await setResourceClearance(
  tenantId,
  'channel',
  channelId,
  CLEARANCE_LEVELS.YELLOW // 3
);

// Document sensible pour responsables
await setResourceClearance(
  tenantId,
  'document',
  docId,
  CLEARANCE_LEVELS.GREEN // 4
);
```

**Actions**:
- [ ] Interface admin pour définir clearance par channel
- [ ] Badge de clearance sur les channels
- [ ] Filtrage automatique des messages selon clearance
- [ ] API `POST /api/resources/clearance` pour assigner
- [ ] Gestion des erreurs 403 avec message clair

### 4.2 Audit Trail des Accès
**Objectif**: Tracer qui accède à quoi

**Actions**:
- [ ] Créer table `access_logs`
- [ ] Logger tous les accès à ressources avec clearance
- [ ] Page admin pour visualiser les logs
- [ ] Alertes pour tentatives d'accès non autorisées
- [ ] Exporter les logs pour compliance

**Schema**:
```typescript
access_logs {
  id, userId, tenantId,
  resourceType, resourceId,
  action, // 'read' | 'write' | 'delete'
  userClearance, requiredClearance,
  granted, // boolean
  timestamp, ipAddress
}
```

---

## 💰 Phase 5 : Billing & Stripe Integration

### 5.1 Système de Plans
**Plans proposés**:
- **Free**: Communication + 1 module au choix, max 50 membres
- **Standard**: Tous modules sauf Analytics, max 200 membres
- **Premium**: Tous modules, membres illimités, support prioritaire
- **Enterprise**: Custom, SSO, SLA, dedicated instance

**Actions**:
- [ ] Intégrer Stripe Checkout
- [ ] Créer webhook `/api/webhooks/stripe`
- [ ] Gérer lifecycle des subscriptions
- [ ] Limites selon le plan (membres, modules, storage)
- [ ] Page de facturation avec invoices
- [ ] Upgrade/Downgrade flows

### 5.2 Activation/Désactivation selon Plan
**Actions**:
- [ ] Vérifier plan dans `activateModule()`
- [ ] Bloquer activation si plan insuffisant
- [ ] Proposer upgrade inline
- [ ] Désactiver modules automatiquement après downgrade
- [ ] Période de grâce avant désactivation

---

## 🎨 Phase 6 : Modules Additionnels

### 6.1 Module Ticketing
**Features**:
- [ ] Création de types de billets
- [ ] Gestion des prix et quotas
- [ ] Checkout avec Stripe
- [ ] QR codes pour validation
- [ ] Rapports de ventes

**Clearance**:
- RED: Acheter billets
- YELLOW: Voir ventes
- GREEN: Configurer tarifs
- BLUE: Voir tous les rapports

### 6.2 Module Schedule
**Features**:
- [ ] Timeline des événements
- [ ] Assignation des bénévoles
- [ ] Notifications de rappel
- [ ] Export calendrier (.ics)
- [ ] Conflits de planning

### 6.3 Module Documents
**Features**:
- [ ] Upload de fichiers
- [ ] Organisation par dossiers
- [ ] Versioning
- [ ] Clearance par document
- [ ] Preview dans l'app

### 6.4 Module Analytics
**Features**:
- [ ] Dashboards par module
- [ ] Graphiques interactifs
- [ ] Export CSV/PDF
- [ ] Métriques temps réel
- [ ] Comparaisons d'événements

**Clearance**: GREEN minimum (4)

---

## 🔧 Phase 7 : DevOps & Production

### 7.1 Monitoring
- [ ] Sentry pour error tracking
- [ ] Vercel Analytics pour performance
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database monitoring (Neon metrics)

### 7.2 CI/CD
- [ ] GitHub Actions pour tests automatiques
- [ ] Preview deployments sur Vercel
- [ ] Migrations database automatiques
- [ ] Rollback strategy

### 7.3 Performance
- [ ] Optimisation des queries DB (indexes)
- [ ] Redis pour cache (optionnel)
- [ ] CDN pour assets statiques
- [ ] Compression des images (sharp)

### 7.4 Sécurité
- [ ] Rate limiting sur API
- [ ] CORS configuration
- [ ] CSP headers
- [ ] Regular security audits
- [ ] Backup automatiques

---

## 📚 Phase 8 : Documentation & Support

### 8.1 Documentation Technique
- [ ] README complet
- [ ] Architecture diagrams
- [ ] API documentation (OpenAPI)
- [ ] Guide de contribution
- [ ] Changelog

### 8.2 Documentation Utilisateur
- [ ] Guide d'onboarding
- [ ] Tutoriels vidéo
- [ ] FAQ
- [ ] Base de connaissances
- [ ] Support chat

---

## 🎯 Priorités Immédiates (Next Session)

### Sprint 1: Architecture PWA & Module Core
1. **Configuration PWA** (1-2h)
   - Créer manifest.json
   - Configurer next-pwa
   - Tester installation sur mobile

2. **Communication Core** (2-3h)
   - Retirer Communication des modules optionnels
   - Toujours activer pour tous les tenants
   - API `registerChannelType()` pour modules

3. **Code Splitting** (3-4h)
   - Créer structure `src/modules/`
   - Implémenter chargement dynamique
   - Intégrer filtrage par clearance

### Sprint 2: Mobile UX
4. **Module Selection UI** (2h)
   - Page `/onboarding/modules`
   - Sélection selon clearance

5. **Notifications** (3h)
   - Table `notification_preferences`
   - Filtrage par module

### Sprint 3: Clearance Avancée
6. **Resource Clearance UI** (2-3h)
   - Interface pour channels
   - Badge de clearance

7. **Access Logs** (2h)
   - Table + logging
   - Page admin

---

## 📊 Métriques de Succès

- **Performance**: Lighthouse score > 90
- **PWA**: Installable sur iOS et Android
- **Bundle Size**: < 200KB initial load
- **Offline**: 90% des fonctions accessibles offline
- **Security**: 0 vulnérabilités critiques
- **UX**: Temps de chargement des modules < 1s

---

## 🔗 Ressources & Documentation

### Architecture Patterns
- [Composable Architecture 2025](https://medium.com/@eitbiz/composable-architecture-in-app-development-why-2025-is-the-year-to-go-modular-f51fdd0b65cc)
- [Android Modularization Guide](https://developer.android.com/topic/modularization)
- [Code Splitting React Native](https://www.callstack.com/blog/code-splitting-in-react-native-applications)

### PWA Resources
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

### Security & Clearance
- [RBAC & Clearance Levels](https://arxiv.org/html/2407.06718v1)
- [Access Control Models](https://www.avigilon.com/blog/access-control-models)

---

## 📝 Notes de Session

**Date**: 2026-01-06
**Completed**:
- ✅ Rainbow Clearance System complet (7 niveaux)
- ✅ Interface admin pour gestion des clearances
- ✅ Système de modules activation/désactivation
- ✅ Validations et sécurité renforcées

**Next Steps**:
- Configuration PWA
- Communication en Core
- Code splitting dynamique

**Database Changes**:
- Ajouté `clearanceLevel` à `tenant_members`
- Créé table `resource_clearance`
- Tout pushé en production ✅

---

*Dernière mise à jour: 2026-01-06*
*Version: 2.0*
