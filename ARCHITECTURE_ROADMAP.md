# ORIZON - Architecture & Roadmap Détaillée

## 🎯 Vision & Positionnement

**Mission**: Simplifier radicalement l'organisation d'événements associatifs avec une plateforme tout-en-un accessible et intelligente.

**Différenciateurs clés**:
1. 🎨 **Design liquid glass moderne** (vs interfaces datées des concurrents)
2. 💬 **Messagerie temps réel contextuelle** avec synthèse IA (unique sur le marché)
3. 💰 **Pricing association-first** (<1€/jour perçu comme très abordable)
4. 🧩 **Architecture modulaire** permettant activation à la carte

---

## 🏗️ Architecture Technique

### Stack Recommandé

```
Frontend:
├── Next.js 15+ (App Router, Server Components)
├── TypeScript (strict mode)
├── Tailwind CSS v4 (OKLCH colors, CSS config)
├── shadcn/ui (composants base customisables)
├── Framer Motion (animations fluides)
└── Zustand (state management léger)

Backend:
├── Drizzle ORM (déjà en place) ✓
├── Neon PostgreSQL Serverless ✓
├── Supabase Realtime (WebSocket managé)
└── Server Actions Next.js (API routes)

Auth & Users:
└── Clerk (déjà en place) ✓

Temps Réel:
├── Supabase Realtime (WebSocket)
├── PostgreSQL LISTEN/NOTIFY (fallback)
└── Optimistic UI updates

IA & Synthèse:
├── DeepSeek API (MVP - $0.70/2M tokens)
├── Migration future: Llama 3.1 self-hosted
└── Streaming responses pour UX fluide

Monitoring:
├── Vercel Analytics (gratuit)
├── Sentry (erreurs, 5k events/mois gratuit)
└── PostHog (analytics produit, gratuit <1M events)

Paiements (Phase 2):
└── Stripe (commission uniquement sur transactions)
```

### Architecture Base de Données

```sql
-- Structure modulaire déjà en place
Core Tables:
├── users (Clerk sync) ✓
├── tenants (événements) ✓
├── tenant_members (permissions) ✓
└── tenant_modules (activation modules) ✓

Module Communication (Nouveau):
├── channels (salon général, par équipe, etc.)
├── messages (contenu + métadonnées)
├── message_reactions (emojis)
├── message_threads (fils de discussion)
├── ai_summaries (résumés générés)
└── read_receipts (statut de lecture)

Module Volunteers (Existant - À compléter):
├── volunteers ✓
├── volunteer_missions ✓
├── volunteer_assignments ✓
├── volunteer_roles ✓
└── volunteer_availability (nouveau - calendrier dispos)

Module Project Management (Futur):
├── projects (rétro-planning)
├── tasks (actions dérivées synthèses IA)
├── milestones (jalons)
└── dependencies (liens entre tâches)

Module Sponsors (Futur):
├── sponsors (entreprises)
├── sponsor_tiers (niveaux partenariat)
├── sponsor_deliverables (contreparties)
└── sponsor_contacts (relations)
```

### Architecture Modulaire

```typescript
// Structure fichiers par module
src/
├── modules/
│   ├── volunteers/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── server-actions/
│   │   ├── types/
│   │   └── config.ts (metadata module)
│   │
│   ├── communication/
│   │   ├── components/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── ChannelSidebar.tsx
│   │   │   └── AISummaryPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useRealtimeMessages.ts
│   │   │   ├── useAISummary.ts
│   │   │   └── useChannels.ts
│   │   ├── server-actions/
│   │   │   ├── sendMessage.ts
│   │   │   ├── generateSummary.ts
│   │   │   └── createChannel.ts
│   │   └── config.ts
│   │
│   └── [future-modules]/
│
├── core/
│   ├── theme/ (système de thèmes)
│   │   ├── ThemeProvider.tsx
│   │   ├── themes.ts (liquid-glass, dark, etc.)
│   │   └── ThemeSwitcher.tsx
│   │
│   ├── realtime/
│   │   ├── RealtimeProvider.tsx (Supabase client)
│   │   └── useRealtimeSubscription.ts
│   │
│   └── permissions/
│       ├── checkModuleAccess.ts
│       └── ModuleGuard.tsx
│
└── db/
    ├── schema.ts ✓
    ├── index.ts ✓
    └── migrations/
```

---

## 🎨 Design System "Liquid Glass"

### Principes de Base

```css
/* Palette OKLCH (Tailwind v4) */
:root {
  /* Surfaces glassmorphiques */
  --glass-bg: oklch(98% 0.01 250 / 0.7);
  --glass-border: oklch(90% 0.02 250 / 0.3);
  --glass-shadow: oklch(20% 0 0 / 0.1);

  /* Accents */
  --primary: oklch(65% 0.25 250); /* Bleu vibrant */
  --secondary: oklch(75% 0.20 300); /* Violet doux */

  /* Adaptation dark mode */
  @media (prefers-color-scheme: dark) {
    --glass-bg: oklch(20% 0.01 250 / 0.5);
    --glass-border: oklch(30% 0.02 250 / 0.4);
  }
}

/* Composants glass */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 8px 32px var(--glass-shadow),
    inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px var(--glass-shadow);
}
```

### Système de Thèmes

```typescript
// src/core/theme/themes.ts
export const themes = {
  'liquid-glass': {
    name: 'Liquid Glass',
    colors: {
      background: 'oklch(98% 0.01 250)',
      foreground: 'oklch(20% 0 0)',
      // ...
    },
    effects: {
      blur: '20px',
      saturation: '180%',
    }
  },
  'dark-glass': {
    name: 'Dark Glass',
    colors: {
      background: 'oklch(15% 0.02 250)',
      foreground: 'oklch(95% 0 0)',
      // ...
    }
  },
  // Thèmes futurs: 'ocean', 'sunset', 'forest'...
}
```

---

## 🚀 Roadmap jusqu'à Novembre 2026

### Phase 1: Fondations Solides (Janvier - Février 2026) - 2 mois

**Objectif**: Architecture modulaire + Design system + Onboarding complet

**Semaines 1-2: Architecture Core**
- [ ] Mettre en place système de thèmes avec ThemeProvider
- [ ] Implémenter Liquid Glass design system (composants base)
- [ ] Créer ModuleRegistry système (activation/désactivation modules)
- [ ] Tests permissions modulaires

**Semaines 3-4: Onboarding Amélioré**
- [ ] Wizard multi-étapes (infos event → choix modules → invitation équipe)
- [ ] Preview en temps réel du tenant créé
- [ ] Setup automatique des channels Communication par défaut
- [ ] Tests A/B sur flow onboarding

**Semaines 5-6: Module Volunteers - Complétion**
- [ ] Calendrier disponibilités bénévoles
- [ ] Assignment automatique missions (suggestions IA légères)
- [ ] Export CSV/PDF des plannings
- [ ] Notifications email/in-app

**Semaines 7-8: Infrastructure Temps Réel**
- [ ] Setup Supabase Realtime
- [ ] RealtimeProvider + hooks réutilisables
- [ ] Tests charge (simuler 100+ utilisateurs simultanés)
- [ ] Optimistic UI patterns

---

### Phase 2: Module Communication (Mars - Avril 2026) - 2 mois

**Objectif**: Messagerie temps réel + Synthèse IA fonctionnelle

**Semaines 9-10: Chat de Base**
- [ ] UI Messagerie (style WhatsApp/Slack)
  - Liste channels sidebar
  - Message list avec scroll infini
  - Input avec formatting (bold, links, mentions)
  - Reactions emojis
- [ ] WebSocket bidirectionnel (envoi/réception messages)
- [ ] Typing indicators ("X est en train d'écrire...")
- [ ] Read receipts (vu par X, Y, Z)

**Semaines 11-12: Features Avancées Chat**
- [ ] Threads (fils de discussion)
- [ ] File uploads (images, PDFs) via Supabase Storage
- [ ] Recherche messages (full-text search PostgreSQL)
- [ ] Notifications push (via Clerk)
- [ ] Statuts utilisateurs (en ligne, absent, occupé)

**Semaines 13-14: Intégration IA - Synthèse**
- [ ] Setup DeepSeek API
- [ ] Bouton "Résumer cette conversation"
- [ ] Streaming response (affichage progressif)
- [ ] Sauvegarde résumés en BDD
- [ ] Résumés automatiques quotidiens (cron job)

**Semaines 15-16: IA → Actions**
- [ ] Parsing résumés pour extraire action items
- [ ] Création automatique tâches dans module Project (si activé)
- [ ] UI review/validation actions suggérées
- [ ] Tests avec vraies conversations de ton équipe festival

---

### Phase 3: Intégrations Externes (Mai - Juin 2026) - 2 mois

**Objectif**: Connecter Discord/Telegram + Emails + APIs tierces

**Semaines 17-18: Intégration Discord**
- [ ] Bot Discord (relaie messages vers Orizon)
- [ ] Webhook bidirectionnel (messages Orizon → Discord)
- [ ] Mapping channels Discord ↔ Orizon
- [ ] Synthèse IA inclut messages Discord

**Semaines 19-20: Intégration Telegram**
- [ ] Bot Telegram avec même logique
- [ ] Gestion multi-plateformes (Discord + Telegram + Orizon)
- [ ] UI unifiée "toutes plateformes"

**Semaines 21-22: Emails & Notifications**
- [ ] Setup SendGrid (gratuit jusqu'à 100 emails/jour)
- [ ] Templates emails professionnels (résumés, invitations, notifications)
- [ ] Digest hebdomadaire automatique
- [ ] Préférences notifications par user

**Semaines 23-24: APIs Tierces**
- [ ] Google Calendar sync (export missions bénévoles)
- [ ] Stripe Connect (préparation billetterie future)
- [ ] Webhooks sortants (pour intégrations custom)

---

### Phase 4: Module Project Management (Juillet - Août 2026) - 2 mois

**Objectif**: Rétro-planning + Gestion tâches collaborative

**Semaines 25-26: Structure Base**
- [ ] Modèles BDD (projects, tasks, milestones)
- [ ] UI Kanban (colonnes: À faire, En cours, Terminé)
- [ ] Création/édition tâches
- [ ] Assignation membres équipe

**Semaines 27-28: Timeline & Gantt**
- [ ] Vue calendrier (rétro-planning visuel)
- [ ] Dépendances entre tâches
- [ ] Jalons critiques (ex: "J-60: Billetterie ouverte")
- [ ] Alertes si retard sur jalons

**Semaines 29-30: Intégration IA**
- [ ] Tâches auto-créées depuis résumés Communication ✓
- [ ] Suggestions priorités (ML simple sur historique)
- [ ] Templates événements ("Festival musique 3 jours")

**Semaines 31-32: Collaboration & Reporting**
- [ ] Commentaires sur tâches
- [ ] Pièces jointes
- [ ] Rapports d'avancement (% complétion par équipe)
- [ ] Export PDF rétro-planning

---

### Phase 5: Polish & Beta Testing (Septembre - Octobre 2026) - 2 mois

**Objectif**: Préparer lancement festival test + feedback utilisateurs

**Semaines 33-36: Beta Privée**
- [ ] Inviter 5-10 autres orgas festivals (bouche-à-oreille)
- [ ] Setup Hotjar (heatmaps, session recordings)
- [ ] Questionnaires satisfaction (NPS)
- [ ] Corrections bugs critiques
- [ ] Optimisations performance (Lighthouse 90+)

**Semaines 37-40: Onboarding Ton Festival**
- [ ] Import données existantes (si applicable)
- [ ] Formation équipe (vidéos tutoriels intégrées)
- [ ] Configuration channels par départements (comm, log, bénévoles...)
- [ ] Tests charge avec vraie équipe
- [ ] Ajustements UX basés sur feedback

**Semaines 41-44: Préparation Lancement Public**
- [ ] Page landing marketing (waitlist)
- [ ] Documentation complète (guides, FAQs)
- [ ] Politique de prix finalisée
- [ ] Setup facturation Stripe
- [ ] Tutoriels vidéo par module

---

### Phase 6: Ton Festival + Itérations (Novembre 2026 +)

**Semaine du 18 Novembre: Utilisation Live**
- Ton festival utilise Orizon en production
- Monitoring intensif (Sentry alerts)
- Support réactif équipe
- Feedback temps réel

**Post-Festival:**
- Rétrospective UX (qu'est-ce qui a sauvé du temps? frustrations?)
- Roadmap modules suivants basée sur learnings:
  - Billetterie (si besoin identifié)
  - Sponsors (si besoin identifié)
  - Trésorerie (si besoin identifié)
  - Logistique avancée

---

## 💰 Stratégie de Monétisation

### Offres Proposées

```
┌─────────────────────────────────────────────────────────────┐
│ FREE (FOREVER)                                              │
├─────────────────────────────────────────────────────────────┤
│ ✓ 2 événements actifs simultanés                           │
│ ✓ 50 participants/bénévoles par événement                  │
│ ✓ Module Communication (illimité messages)                 │
│ ✓ Module Volunteers (basique)                              │
│ ✓ 1 résumé IA par mois                                     │
│ ✓ Support communautaire                                    │
│                                                             │
│ 🎯 Cible: Petites assos, événements ponctuels             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PRO - 29€/mois (~0.96€/jour)                               │
├─────────────────────────────────────────────────────────────┤
│ ✓ Événements illimités                                     │
│ ✓ Participants/bénévoles illimités                         │
│ ✓ Tous modules (Project, Sponsors...)                      │
│ ✓ 20 résumés IA/mois                                       │
│ ✓ Intégrations Discord/Telegram                            │
│ ✓ Exports avancés (PDF, CSV)                               │
│ ✓ White-label partiel (logo custom)                        │
│ ✓ Support email prioritaire (réponse <24h)                 │
│                                                             │
│ 🎯 Cible: Festivals récurrents, assos structurées          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ENTERPRISE - Sur devis (à partir de 200€/mois)            │
├─────────────────────────────────────────────────────────────┤
│ ✓ Tout PRO +                                               │
│ ✓ Résumés IA illimités                                     │
│ ✓ SSO (connexion unique entreprise)                        │
│ ✓ API dédiée + webhooks customs                            │
│ ✓ White-label complet (domaine custom)                     │
│ ✓ Formation équipe incluse                                 │
│ ✓ Support dédié (chat direct, calls)                       │
│ ✓ SLA 99.9% uptime                                         │
│                                                             │
│ 🎯 Cible: Gros festivals, réseaux d'assos                  │
└─────────────────────────────────────────────────────────────┘
```

### Revenus Estimés (Hypothèse Conservative)

**Objectif An 1 (2027):**
- 500 utilisateurs FREE (€0 revenus mais données/feedback précieuses)
- 50 utilisateurs PRO (50 × 29€ × 12 = **17 400€/an**)
- 2 clients ENTERPRISE (2 × 250€ × 12 = **6 000€/an**)
- **Total: ~23 400€/an** (1 950€/mois)

**Coûts Estimés:**
- Supabase: ~50€/mois
- DeepSeek API: ~10€/mois (50 users PRO × 20 résumés)
- Vercel: ~20€/mois
- Sentry/Analytics: ~0€ (tiers gratuits)
- **Total: ~80€/mois** (960€/an)

**Marge brute An 1: ~22 440€** (95% de marge!)

---

## 🔐 Stratégie Coûts IA

### Phase MVP (0-500 users)
```
DeepSeek API:
- $0.70 / 2M tokens
- Résumé moyen: 5000 tokens input + 500 output = 5500 tokens
- 500 résumés/mois = 2.75M tokens = $0.96/mois

✅ Quasi gratuit, parfait pour démarrage
```

### Phase Scale (500-5000 users)
```
Migration Llama 3.1 8B (self-hosted):
- VPS GPU (Hetzner): ~50€/mois
- Traite 100 résumés/heure
- Coût fixe vs variable API

Calcul breakeven:
- DeepSeek à 5000 résumés/mois = $9.60/mois
- Llama self-hosted = 50€/mois
→ Migration pertinente à partir de ~10k résumés/mois
```

**Stratégie recommandée:**
1. Démarrer DeepSeek (simple, pas de gestion infra)
2. Monitorer usage réel
3. Migrer Llama si coûts dépassent 40€/mois

---

## 📊 Métriques de Succès

### KPIs Techniques
- **Uptime**: >99% (Vercel + Neon ont excellente fiabilité)
- **Latence messages**: <200ms (WebSocket Supabase)
- **Lighthouse Score**: >90 (performance, accessibilité)
- **Time to First Message**: <3s après connexion

### KPIs Produit
- **Activation**: >60% users créent au moins 1 message dans les 7 jours
- **Retention D7**: >40% (reviennent après 1 semaine)
- **NPS Score**: >50 (excellent pour SaaS B2B)
- **Conversion FREE→PRO**: >3% (objectif réaliste)

### KPIs Business
- **CAC** (Coût Acquisition Client): <100€ (organique + bouche-à-oreille)
- **LTV** (Lifetime Value): >348€ (29€/mois × 12 mois retention moyenne)
- **LTV/CAC Ratio**: >3 (signe de business sain)

---

## 🛡️ Risques & Mitigations

### Risques Techniques

**1. Coûts IA explosent**
- Mitigation: Quotas stricts par plan, cache résumés, rate limiting
- Alerte si coût mensuel dépasse 100€

**2. Supabase Realtime lent sous charge**
- Mitigation: Tests charge avant lancement, fallback polling, CDN edges
- Plan B: Migrer Ably (payant mais performant)

**3. Migration Drizzle complexe**
- ✅ Déjà mitigé (migration faite!)

### Risques Produit

**4. Adoption faible module Communication**
- Mitigation: Onboarding force création 1er message, templates conversations

**5. Users préfèrent garder WhatsApp/Slack**
- Mitigation: Intégrations bidirectionnelles (pont vers ces outils)
- USP: Synthèse IA marche sur TOUS les messages (WhatsApp inclus via intégration)

### Risques Business

**6. Freemium trop généreux, personne ne paie**
- Mitigation: Limites FREE bien calibrées (testé via research concurrents)
- Killer feature PRO: Résumés IA 20/mois vs 1/mois (besoin ressenti)

**7. Concurrents copient ton USP**
- Mitigation: Avance technologique (12-18 mois avant copie), focus UX irréprochable
- Niche "Associations françaises" moins attractive pour gros acteurs

---

## 🎯 Prochaines Étapes Immédiates

### Cette Semaine (Priorité P0)
1. **Décider stack Realtime**: Supabase ou autre? (je recommande Supabase)
2. **Setup Supabase project** si validation
3. **Créer ThemeProvider** + thème "liquid-glass" de base
4. **Améliorer onboarding** (wizard multi-étapes)

### Semaine Prochaine (Priorité P1)
5. **Schéma BDD Communication** (channels, messages, summaries)
6. **Premiers composants Chat UI** (MessageList, MessageInput)
7. **Tests Realtime** (send/receive messages basiques)

### Fin Janvier (Priorité P2)
8. **Module Communication fonctionnel** (MVP sans IA)
9. **Setup DeepSeek API**
10. **Premier résumé IA** qui marche

---

**Questions?** Dis-moi ce qui te semble prioritaire et on attaque! 🚀
