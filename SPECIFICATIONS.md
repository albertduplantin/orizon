# ORIZON - Spécifications Techniques Détaillées

**Version**: 1.0
**Date**: 2026-01-09
**Modules Prioritaires**: Documents, Gestion de Projet, Réunions & Votes

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Module Documents & GED](#module-documents--ged)
3. [Module Gestion de Projet](#module-gestion-de-projet)
4. [Module Réunions & Votes](#module-réunions--votes)
5. [Module Membres & Cotisations](#module-membres--cotisations)
6. [Communication Améliorée](#communication-améliorée)
7. [Système d'Invitation](#système-dinvitation)
8. [Automatisations](#automatisations)
9. [Architecture Technique](#architecture-technique)

---

## 🎯 Vue d'ensemble

### Contexte Organisation
- **Type**: Association loi 1901
- **Structure**: Bureau (10 pers) + CA (15 pers) + Bénévoles (80 pers)
- **Activité**: Festival annuel + événements ponctuels
- **Besoin**: Remplacer Google Drive + Slack + emails épars

### Objectifs Clés
1. **Centralisation**: Tout dans ORIZON (docs, projets, comms)
2. **Automatisation**: Réduire tâches répétitives (convocations, relances)
3. **Traçabilité**: Historique décisions, heures bénévoles, signatures
4. **Accessibilité**: PWA mobile-first, UX niveau Slack

### Principe Rainbow Clearance

| Niveau | Nom | Rôle Asso | Accès Type |
|--------|-----|-----------|------------|
| 0 | INFRARED | Public | Site vitrine, infos publiques |
| 1 | RED | Participant | Inscription événements |
| 2 | ORANGE | Bénévole | Missions, planning, docs généraux |
| 3 | YELLOW | Coordinateur | Gestion équipe, projets |
| 4 | GREEN | Responsable | Budget, analytics, rapports |
| 5 | BLUE | CA + Bureau | Gouvernance, votes, PV |
| 6 | ULTRAVIOLET | Président | Configuration complète |

---

## 📁 Module Documents & GED

### Objectifs
- Remplacer Google Drive par GED intégrée
- Workflow validation (Brouillon → Bureau → CA → Archivé)
- Templates réutilisables (PV, conventions)
- Signature électronique simple
- Recherche plein texte + tags libres

### Architecture Base de Données

```typescript
// Schema Drizzle
export const documentFolders = pgTable('document_folders', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenantId').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  description: text('description'),
  parentId: text('parentId').references(() => documentFolders.id), // Arborescence
  clearanceRequired: integer('clearanceRequired').default(2), // ORANGE par défaut
  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenantId').notNull().references(() => tenants.id),
  folderId: text('folderId').references(() => documentFolders.id),

  // Métadonnées
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'pdf', 'docx', 'image', 'template'

  // Stockage (Supabase Storage gratuit 1GB)
  storageUrl: text('storageUrl').notNull(),
  storagePath: text('storagePath').notNull(),
  fileSize: integer('fileSize'), // bytes
  mimeType: text('mimeType'),

  // Versioning
  version: integer('version').default(1),
  parentDocumentId: text('parentDocumentId').references(() => documents.id),
  isLatestVersion: boolean('isLatestVersion').default(true),

  // Workflow
  status: text('status').notNull().default('draft'),
  // 'draft', 'pending_bureau', 'pending_ca', 'approved', 'archived'

  // Tags & Recherche
  tags: text('tags').array(), // ['Subvention 2024', 'Partenariat X']
  extractedText: text('extractedText'), // Pour recherche plein texte

  // Permissions
  clearanceRequired: integer('clearanceRequired').default(2),

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const documentTemplates = pgTable('document_templates', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenantId').references(() => tenants.id),
  name: text('name').notNull(), // "PV CA", "Convention partenaire"
  description: text('description'),
  category: text('category'), // 'pv', 'convention', 'contrat', 'subvention'

  // Template storage (HTML riche ou Markdown)
  contentTemplate: text('contentTemplate').notNull(),
  variables: jsonb('variables'), // {title, date, participants, ...}

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
});

export const documentSignatures = pgTable('document_signatures', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('documentId').notNull().references(() => documents.id),
  userId: text('userId').notNull().references(() => users.id),
  signedAt: timestamp('signedAt').defaultNow(),
  role: text('role'), // 'president', 'secretaire', 'tresorier'
  ipAddress: text('ipAddress'),
});

export const documentVersions = pgTable('document_versions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  documentId: text('documentId').notNull().references(() => documents.id),
  version: integer('version').notNull(),
  storageUrl: text('storageUrl').notNull(),
  changedBy: text('changedBy').references(() => users.id),
  changeLog: text('changeLog'), // "Correction montant budget"
  createdAt: timestamp('createdAt').defaultNow(),
});
```

### Fonctionnalités Clés

#### 1. Arborescence Dossiers
```
Documents/
├─ 📁 CA/
│  ├─ 📁 2024/
│  │  ├─ PV-CA-Mars-2024.pdf (signé ✅)
│  │  └─ Budget-2024.xlsx (approuvé)
│  └─ 📁 2025/
├─ 📁 Bureau/
├─ 📁 Conventions/
│  └─ Convention-Mairie-2024.pdf
├─ 📁 Subventions/
│  ├─ 📁 DRAC-2024/
│  │  ├─ Dossier-DRAC.pdf
│  │  └─ Justificatifs/
│  └─ 📁 Region-2024/
└─ 📁 Templates/
   ├─ Template-PV-CA.docx
   └─ Template-Convention.docx
```

- **Clearance par dossier** : Dossier "CA" = BLUE (5), "Subventions" = GREEN (4)
- **Héritage** : Sous-dossiers héritent clearance parent (modifiable)

#### 2. Upload & Stockage

**Solution**: **Supabase Storage** (gratuit 1GB, largement suffisant pour docs texte/PDF)

```typescript
// Upload flow
async function uploadDocument(file: File, folderId: string) {
  // 1. Upload vers Supabase Storage
  const path = `${tenantId}/${folderId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file);

  // 2. Extraction texte pour recherche (si PDF)
  const extractedText = await extractPDFText(file); // Library pdf-parse

  // 3. Créer entry DB
  await db.insert(documents).values({
    name: file.name,
    folderId,
    storageUrl: data.publicUrl,
    storagePath: path,
    extractedText,
    tags: [],
    status: 'draft',
  });
}
```

**Alternative gratuite**: **Vercel Blob** (1GB gratuit aussi) si Supabase pose problème.

#### 3. Templates & Génération

**Exemple Template PV CA** :
```html
<div class="pv-template">
  <h1>Procès-Verbal CA du {{date}}</h1>

  <section>
    <h2>Présents</h2>
    <ul>
      {{#participants}}
      <li>{{name}} - {{role}}</li>
      {{/participants}}
    </ul>
  </section>

  <section>
    <h2>Ordre du Jour</h2>
    {{agenda}}
  </section>

  <section>
    <h2>Délibérations</h2>
    {{deliberations}}
  </section>

  <div class="signatures">
    <div>
      <strong>Président :</strong>
      {{#president_signature}}✅ Signé le {{date}}{{/president_signature}}
    </div>
    <div>
      <strong>Secrétaire :</strong>
      {{#secretaire_signature}}✅ Signé le {{date}}{{/secretaire_signature}}
    </div>
  </div>
</div>
```

**Moteur** : **Handlebars.js** (simple, éprouvé) ou **Mustache**

#### 4. Workflow Validation

```typescript
type DocumentStatus =
  | 'draft'           // Brouillon éditable
  | 'pending_bureau'  // Soumis au Bureau
  | 'pending_ca'      // Validé Bureau → CA
  | 'approved'        // Approuvé définitif
  | 'rejected'        // Rejeté (avec commentaires)
  | 'archived';       // Archivé (lecture seule)

// Actions disponibles selon rôle
const workflowActions = {
  draft: {
    author: ['edit', 'delete', 'submit_bureau'],
  },
  pending_bureau: {
    bureau: ['approve', 'reject', 'request_changes'],
    author: ['edit', 'cancel'],
  },
  pending_ca: {
    ca: ['approve', 'reject'],
  },
  approved: {
    all: ['view', 'download'],
    admin: ['archive'],
  },
};
```

**UI Workflow** :
```
[Brouillon]
  ↓ (auteur clique "Soumettre au Bureau")
[En attente Bureau] 🟡
  ↓ (membre Bureau clique "Valider")
[En attente CA] 🟠
  ↓ (membre CA vote "Approuver")
[Approuvé] ✅
  ↓ (archivage auto après 5 ans)
[Archivé] 📦
```

#### 5. Signature Électronique Simple

**Flow** :
1. Document status = `approved`
2. Système identifie signataires requis (Président + Secrétaire pour PV)
3. Notification → "Merci de signer PV CA Mars 2024"
4. Signataire clique "Signer" → Confirmation dialog
5. Insertion DB : `{userId, documentId, signedAt, ipAddress}`
6. Badge "✅ Signé" apparaît sur document

**Pas de certificat cryptographique** (coût élevé), juste **traçabilité horodatée** + IP.

**Génération PDF signé** :
```typescript
// Ajouter signatures au PDF original
import { PDFDocument } from 'pdf-lib';

async function addSignaturesToPDF(documentId: string) {
  const doc = await PDFDocument.load(originalPdfBytes);
  const signatures = await getDocumentSignatures(documentId);

  const page = doc.getPage(doc.getPageCount() - 1);
  page.drawText(
    `✅ Signé par ${president.name} le ${formatDate(signedAt)}`,
    { x: 50, y: 50 }
  );

  const pdfBytes = await doc.save();
  // Upload nouvelle version
}
```

#### 6. Recherche & Tags

**Recherche plein texte** :
- PostgreSQL `tsvector` + `tsquery` (gratuit, intégré)
- Index GIN sur `extractedText`

```sql
-- Index de recherche
CREATE INDEX documents_search_idx ON documents
USING GIN (to_tsvector('french', extracted_text));

-- Query
SELECT * FROM documents
WHERE to_tsvector('french', extracted_text) @@ to_tsquery('french', 'subvention & région');
```

**Tags autocomplete** :
```typescript
// Suggérer tags existants pendant saisie
const suggestedTags = await db
  .selectDistinct({ tag: sql`unnest(tags)` })
  .from(documents)
  .where(sql`unnest(tags) ILIKE ${query + '%'}`)
  .limit(5);
```

---

## 📊 Module Gestion de Projet

### Objectifs
- Gérer projet Festival annuel (Kanban + calendrier)
- Tâches avec multi-responsables, deadlines
- Liens budget ↔ docs ↔ missions bénévoles
- Jalons de validation (ex: "Dossier DRAC bouclé")

### Architecture Base de Données

```typescript
export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenantId').notNull().references(() => tenants.id),

  name: text('name').notNull(), // "Festival 2025"
  description: text('description'),
  color: text('color').default('#6366f1'), // Pour UI

  // Dates
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),

  // Organisation
  category: text('category'), // 'event', 'infrastructure', 'subvention'
  status: text('status').default('active'), // 'planning', 'active', 'completed', 'archived'

  // Permissions
  clearanceRequired: integer('clearanceRequired').default(3), // YELLOW

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
});

export const projectBoards = pgTable('project_boards', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('projectId').notNull().references(() => projects.id),
  name: text('name').notNull(), // "Logistique", "Communication"
  position: integer('position').default(0), // Ordre affichage
});

export const projectColumns = pgTable('project_columns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  boardId: text('boardId').notNull().references(() => projectBoards.id),
  name: text('name').notNull(), // "À faire", "En cours", "Terminé"
  color: text('color'),
  position: integer('position').default(0),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('projectId').notNull().references(() => projects.id),
  columnId: text('columnId').notNull().references(() => projectColumns.id),

  // Infos tâche
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').default(0), // Ordre dans colonne

  // Responsables (multi)
  assignees: text('assignees').array(), // [userId1, userId2]

  // Planning
  dueDate: timestamp('dueDate'),
  estimatedHours: integer('estimatedHours'),
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'

  // Liens
  linkedBudgetId: text('linkedBudgetId'), // Vers module Trésorerie (futur)
  linkedDocuments: text('linkedDocuments').array(), // [docId1, docId2]
  linkedMissionId: text('linkedMissionId'), // Vers module Volunteers

  // Status
  status: text('status').default('todo'), // 'todo', 'in_progress', 'blocked', 'done'
  completedAt: timestamp('completedAt'),

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
});

export const taskComments = pgTable('task_comments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  taskId: text('taskId').notNull().references(() => tasks.id),
  userId: text('userId').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const projectMilestones = pgTable('project_milestones', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('projectId').notNull().references(() => projects.id),
  name: text('name').notNull(), // "Dossier DRAC bouclé"
  dueDate: timestamp('dueDate'),
  status: text('status').default('pending'), // 'pending', 'completed'
  completedAt: timestamp('completedAt'),
});
```

### Fonctionnalités Clés

#### 1. Vue Kanban (Style Trello)

**Exemple Board "Festival 2025"** :
```
┌─ Communication ─────────────────────────────────────────┐
│ À faire         En cours          Terminé               │
│ ┌─────────┐    ┌─────────┐      ┌─────────┐           │
│ │Créer    │    │Affiche  │      │Logo     │           │
│ │affiche  │    │Facebook │      │validé   │✅         │
│ │📅 15/03 │    │👤 Marie │      │         │           │
│ │👤 Paul  │    │         │      │         │           │
│ └─────────┘    └─────────┘      └─────────┘           │
└──────────────────────────────────────────────────────────┘

┌─ Logistique ─────────────────────────────────────────────┐
│ À faire         En cours          Terminé               │
│ ┌─────────┐    ┌─────────┐      ┌─────────┐           │
│ │Réserver │    │Devis    │      │Salle OK │✅         │
│ │sono     │    │traiteur │      │💰 1500€ │           │
│ │🔗 Doc#42│    │📎 3 docs│      │📄 Contrat│          │
│ │📅 01/04 │    │👤 Sophie│      │         │           │
│ │⚠️ URGENT│    │👤 Marc  │      │         │           │
│ └─────────┘    └─────────┘      └─────────┘           │
└──────────────────────────────────────────────────────────┘
```

**Drag & Drop** : Library `@dnd-kit/core` (React, accessible)

#### 2. Vue Calendrier

**Timeline des deadlines** :
```
Mars 2025
│
├─ 15/03 : Affiche validée 🎨
├─ 20/03 : Dossier DRAC envoyé 📄 [JALON]
└─ 31/03 : Contrat salle signé ✍️

Avril 2025
│
├─ 01/04 : Sono réservée 🔊 [URGENT]
├─ 15/04 : Programme finalisé 📋
└─ 30/04 : Billetterie ouverte 🎫 [JALON]
```

**Library** : `react-big-calendar` ou `FullCalendar` (gratuit)

#### 3. Tâche Détaillée - Card

```
┌────────────────────────────────────────────────┐
│ 🎨 Créer affiche Festival 2025                 │
├────────────────────────────────────────────────┤
│ Description:                                   │
│ Créer visuel principal pour communication      │
│                                                │
│ 👥 Assignés: Paul, Marie                       │
│ 📅 Deadline: 15/03/2025                        │
│ ⏱️ Estimation: 8 heures                        │
│ ⚠️ Priorité: HAUTE                             │
│                                                │
│ 🔗 Liens:                                      │
│ • 📄 Brief graphique.pdf                       │
│ • 📄 Logos partenaires.zip                     │
│ • 💰 Budget communication (500€)               │
│                                                │
│ 💬 Commentaires (3):                           │
│ • Marie: "Premier draft prêt"                  │
│ • Paul: "Validé par Bureau ✅"                 │
│                                                │
│ [✅ Marquer terminée] [🗑️ Supprimer]           │
└────────────────────────────────────────────────┘
```

#### 4. Jalons (Milestones)

```typescript
// Milestone = étape critique du projet
const milestones = [
  {
    name: "Dossier DRAC bouclé",
    dueDate: "2025-03-20",
    tasks: [task1, task2, task3], // Tâches liées
  },
  {
    name: "Programme finalisé",
    dueDate: "2025-04-15",
    tasks: [task4, task5],
  },
];

// Progression auto : milestone complété si toutes tâches done
const progress = completedTasks / totalTasks;
```

**UI Jalon** :
```
📍 JALON: Dossier DRAC bouclé
   Deadline: 20/03/2025 (dans 15 jours)
   Progression: ▓▓▓▓▓░░░░░ 60% (3/5 tâches)

   Tâches restantes:
   • Collecter justificatifs (Marie)
   • Relire dossier (Paul)
```

---

## 🗳️ Module Réunions & Votes

### Objectifs
- Convoquer CA (4/an) + Bureau (12/an) + AG (1/an)
- Ordre du jour collaboratif
- PV avec éditeur riche + upload externe
- IA : génération PV + synthèse historique + extraction actions
- Votes physiques + asynchrones + visio
- Délégation de votes

### Architecture Base de Données

```typescript
export const meetings = pgTable('meetings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenantId').notNull().references(() => tenants.id),

  // Type & Métadonnées
  type: text('type').notNull(), // 'ca', 'bureau', 'ag', 'extraordinaire'
  title: text('title').notNull(), // "CA Mars 2025"
  date: timestamp('date').notNull(),
  location: text('location'), // "Siège asso" ou "Zoom"
  isVirtual: boolean('isVirtual').default(false),
  virtualLink: text('virtualLink'), // Lien Zoom/Meet

  // Workflow
  status: text('status').default('draft'),
  // 'draft', 'convocation_sent', 'in_progress', 'pv_draft', 'pv_validated', 'archived'

  // Convocation
  convocationSentAt: timestamp('convocationSentAt'),

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id), // Secrétaire
});

export const meetingAgenda = pgTable('meeting_agenda', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  meetingId: text('meetingId').notNull().references(() => meetings.id),

  title: text('title').notNull(), // "Validation budget 2025"
  description: text('description'),
  estimatedDuration: integer('estimatedDuration'), // minutes
  position: integer('position').default(0), // Ordre

  // Documents liés
  linkedDocuments: text('linkedDocuments').array(),

  // Proposé par
  proposedBy: text('proposedBy').references(() => users.id),
  approvedByOrganizer: boolean('approvedByOrganizer').default(false),

  createdAt: timestamp('createdAt').defaultNow(),
});

export const meetingParticipants = pgTable('meeting_participants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  meetingId: text('meetingId').notNull().references(() => meetings.id),
  userId: text('userId').notNull().references(() => users.id),

  // RSVP
  status: text('status').default('pending'),
  // 'pending', 'confirmed', 'declined', 'maybe'

  // Présence effective
  attendance: text('attendance'),
  // 'present', 'absent', 'excused', 'virtual'

  // Délégation
  delegatedTo: text('delegatedTo').references(() => users.id),

  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const meetingMinutes = pgTable('meeting_minutes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  meetingId: text('meetingId').notNull().references(() => meetings.id),

  // Contenu PV
  content: text('content').notNull(), // HTML riche ou Markdown

  // Upload externe
  externalDocumentId: text('externalDocumentId').references(() => documents.id),

  // Génération IA
  generatedByAI: boolean('generatedByAI').default(false),
  sourceNotes: text('sourceNotes'), // Notes brutes utilisées pour génération

  // Workflow validation
  status: text('status').default('draft'), // 'draft', 'pending_validation', 'validated'
  validatedBy: text('validatedBy').references(() => users.id),
  validatedAt: timestamp('validatedAt'),

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
});

export const votes = pgTable('votes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenantId').notNull().references(() => tenants.id),
  meetingId: text('meetingId').references(() => meetings.id), // Null si vote asynchrone

  // Vote
  title: text('title').notNull(), // "Validation budget 2025"
  description: text('description'),
  type: text('type').notNull(), // 'physical', 'async', 'virtual'

  // Visibilité
  isSecret: boolean('isSecret').default(false),

  // Timing (pour async)
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),

  // Résultats
  status: text('status').default('open'), // 'open', 'closed', 'cancelled'
  resultFor: integer('resultFor').default(0),
  resultAgainst: integer('resultAgainst').default(0),
  resultAbstain: integer('resultAbstain').default(0),

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id),
});

export const voteBallets = pgTable('vote_ballets', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  voteId: text('voteId').notNull().references(() => votes.id),
  userId: text('userId').notNull().references(() => users.id),

  choice: text('choice').notNull(), // 'for', 'against', 'abstain'

  // Délégation
  isDelegated: boolean('isDelegated').default(false),
  delegatedFrom: text('delegatedFrom').references(() => users.id),

  createdAt: timestamp('createdAt').defaultNow(),
});
```

### Fonctionnalités Clés

#### 1. Workflow Réunion Complet

```
┌─ CRÉATION (J-15) ────────────────────────────────────┐
│ Secrétaire crée réunion                              │
│ • Type: CA                                           │
│ • Date: 15/03/2025 19h                               │
│ • Lieu: Siège asso                                   │
│ • Ordre du jour initial                              │
│ → Status: draft                                      │
└──────────────────────────────────────────────────────┘
         ↓
┌─ CONVOCATION (J-7) ──────────────────────────────────┐
│ Email auto envoyé à tous membres CA                  │
│ • Lien RSVP : ✅ Présent / ❌ Absent / 🤔 Peut-être  │
│ • Ordre du jour complet (+ suggestions validées)     │
│ • Docs préparatoires (budget, rapports...)           │
│ → Status: convocation_sent                           │
└──────────────────────────────────────────────────────┘
         ↓
┌─ RAPPELS ────────────────────────────────────────────┐
│ J-1 : Email/SMS "Demain CA 19h"                      │
│ J-0 (18h) : Notification push "Dans 1h"              │
└──────────────────────────────────────────────────────┘
         ↓
┌─ RÉUNION EN COURS ───────────────────────────────────┐
│ • Dashboard live : qui est arrivé (scan QR/manuel)   │
│ • Prise notes collaborative (optionnel)              │
│ • Votes enregistrés en direct                        │
│ → Status: in_progress                                │
└──────────────────────────────────────────────────────┘
         ↓
┌─ POST-RÉUNION (J+1 à J+7) ───────────────────────────┐
│ Secrétaire rédige PV :                               │
│ • Option 1 : Éditeur riche dans ORIZON               │
│ • Option 2 : Upload Word/PDF externe                │
│ • Option 3 : 🤖 "Générer brouillon IA" depuis notes │
│ → Status: pv_draft                                   │
└──────────────────────────────────────────────────────┘
         ↓
┌─ VALIDATION PV ──────────────────────────────────────┐
│ Président + Secrétaire signent                       │
│ • Bouton "Approuver PV"                              │
│ • Signature auto ajoutée au document                 │
│ → Status: pv_validated                               │
└──────────────────────────────────────────────────────┘
         ↓
┌─ DIFFUSION ──────────────────────────────────────────┐
│ Email auto : "PV CA Mars disponible"                 │
│ • Lien vers doc signé                                │
│ • Archivage auto dans Documents/CA/2025/             │
│ → Status: archived                                   │
└──────────────────────────────────────────────────────┘
```

#### 2. Ordre du Jour Collaboratif

**Interface** :
```
┌─ Ordre du Jour - CA Mars 2025 ──────────────────┐
│                                                  │
│ [+ Proposer un point] (accessible aux membres)  │
│                                                  │
│ ✅ 1. Validation PV précédent (5 min)           │
│      📄 PV-CA-Janvier.pdf                       │
│                                                  │
│ ✅ 2. Validation Budget 2025 (30 min)           │
│      📄 Budget-2025.xlsx                        │
│      Proposé par: Marie (Trésorière)            │
│      💬 2 commentaires                           │
│                                                  │
│ ⏳ 3. Point subvention DRAC (15 min)            │
│      Proposé par: Paul                          │
│      ⚠️ En attente validation organisateur      │
│                                                  │
│ ✅ 4. Bilan communication (10 min)              │
│                                                  │
│ ── Durée totale estimée: 1h00 ──                │
└──────────────────────────────────────────────────┘
```

**Workflow proposition** :
1. Membre clique "+ Proposer un point"
2. Saisit titre + description + docs
3. Status : `approvedByOrganizer = false`
4. Notification → Secrétaire
5. Secrétaire approuve → Apparaît dans ordre du jour

#### 3. IA - Génération PV 🤖

**Feature 1 : Générer brouillon PV depuis notes**

```typescript
// API Route: /api/meetings/[id]/generate-pv
async function generatePVFromNotes(meetingId: string, notes: string) {
  const meeting = await getMeeting(meetingId);
  const agenda = await getAgenda(meetingId);
  const participants = await getParticipants(meetingId);

  const prompt = `
Tu es secrétaire d'association. Génère un PV formel depuis ces notes de réunion.

RÉUNION:
Type: ${meeting.type}
Date: ${meeting.date}
Participants: ${participants.map(p => p.name).join(', ')}

ORDRE DU JOUR:
${agenda.map(item => `- ${item.title}`).join('\n')}

NOTES BRUTES:
${notes}

INSTRUCTIONS:
- Structure: Présents, Ordre du jour, Délibérations, Votes, Décisions, Actions
- Ton formel et concis
- Numéroter les décisions
- Format HTML propre
`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}
```

**Feature 2 : Synthèse PV multiples**

```typescript
// Interface
┌─ Synthèse Historique PV ──────────────────────────┐
│ Sélectionner PV à résumer:                        │
│ ☑️ CA Janvier 2025                                │
│ ☑️ CA Mars 2025                                   │
│ ☑️ CA Juin 2025                                   │
│ ☐ CA Septembre 2025                               │
│                                                    │
│ [🤖 Générer synthèse]                             │
└────────────────────────────────────────────────────┘

// Résultat
┌─ Synthèse CA 1er Semestre 2025 ───────────────────┐
│                                                    │
│ DÉCISIONS MAJEURES:                                │
│ • Budget 2025 validé : 150K€                       │
│ • Subvention DRAC obtenue : 30K€                   │
│ • Nouveau partenariat Mairie                       │
│                                                    │
│ ACTIONS EN COURS:                                  │
│ • Recrutement trésorier adjoint (Paul)             │
│ • Refonte site web (Marie)                         │
│ • Dossier Région à finaliser (Sophie)              │
│                                                    │
│ [📊 Exporter PDF] [➕ Ajouter au projet]           │
└────────────────────────────────────────────────────┘
```

**Feature 3 : Extraction actions → Tâches projet**

```typescript
// IA détecte actions dans PV
const actions = extractActionsFromPV(pvContent);
// [
//   {person: "Paul", action: "Recruter trésorier adjoint", deadline: "30/06"},
//   {person: "Marie", action: "Refonte site web", deadline: "15/09"},
// ]

// Proposition utilisateur
┌─ Actions détectées dans PV ───────────────────────┐
│ 3 actions à transformer en tâches projet ?        │
│                                                    │
│ ✅ Recruter trésorier adjoint                     │
│    👤 Paul | 📅 30/06/2025                        │
│    Projet: Administration                         │
│                                                    │
│ ✅ Refonte site web                               │
│    👤 Marie | 📅 15/09/2025                       │
│    Projet: Communication                          │
│                                                    │
│ [✅ Créer 2 tâches sélectionnées]                 │
└────────────────────────────────────────────────────┘
```

#### 4. Système de Votes

**Vote Physique** (enregistrement résultat) :
```
┌─ Vote : Validation Budget 2025 ───────────────────┐
│ Type: Physique (en réunion CA)                    │
│ Date: 15/03/2025                                  │
│                                                    │
│ Résultat:                                         │
│ ✅ Pour : ▓▓▓▓▓▓▓▓░░ 12 voix (80%)               │
│ ❌ Contre : ▓░░░░░░░░░ 2 voix (13%)               │
│ ⚪ Abstention : ▓░░░░░░░░░ 1 voix (7%)            │
│                                                    │
│ → Adopté ✅                                       │
└────────────────────────────────────────────────────┘
```

**Vote Asynchrone** (entre réunions) :
```
┌─ Vote : Approbation Convention Mairie ────────────┐
│ Type: Asynchrone                                  │
│ Ouverture: 01/04/2025 00h00                       │
│ Clôture: 07/04/2025 23h59 (dans 3 jours)          │
│                                                    │
│ Progression: 10/15 membres ont voté (67%)         │
│                                                    │
│ Votre vote: [✅ Pour] [❌ Contre] [⚪ Abstention]  │
│                                                    │
│ Résultats actuels (visibles uniquement après):   │
│ 🔒 Cachés jusqu'à clôture                         │
│                                                    │
│ ⏰ Rappel envoyé à 5 membres n'ayant pas voté     │
└────────────────────────────────────────────────────┘
```

**Délégation** :
```typescript
// Participant déclare délégation
await db.insert(meetingParticipants).values({
  meetingId,
  userId: 'marie-id',
  status: 'declined',
  delegatedTo: 'paul-id', // Paul votera pour Marie
});

// Lors du vote
const paulVote = {
  voteId,
  userId: 'paul-id',
  choice: 'for',
  isDelegated: false,
};

const marieDelegatedVote = {
  voteId,
  userId: 'paul-id', // Paul vote
  choice: 'for',
  isDelegated: true,
  delegatedFrom: 'marie-id', // Au nom de Marie
};

// Comptage : Paul = 2 voix
```

---

## 👥 Module Membres & Cotisations

### Objectifs
- Annuaire complet avec compétences/dispo
- Suivi heures bénévolat + attestations
- Gestion cotisations (tracking + paiement)
- Gamification sobre adaptée

### Architecture Base de Données

```typescript
export const memberProfiles = pgTable('member_profiles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id),
  tenantId: text('tenantId').notNull().references(() => tenants.id),

  // Infos complémentaires
  bio: text('bio'),
  skills: text('skills').array(), // ['Graphisme', 'Compta', 'Logistique']

  // Disponibilités
  availabilityWeekends: boolean('availabilityWeekends').default(false),
  availabilityEvenings: boolean('availabilityEvenings').default(false),
  availabilitySchoolHolidays: boolean('availabilitySchoolHolidays').default(false),
  unavailableDates: jsonb('unavailableDates'), // [{start, end}]

  // Logistique
  hasDriverLicense: boolean('hasDriverLicense').default(false),
  hasVehicle: boolean('hasVehicle').default(false),
  vehicleSeats: integer('vehicleSeats'),

  // Zone géo
  city: text('city'),
  postalCode: text('postalCode'),
  maxTravelDistance: integer('maxTravelDistance'), // km

  // Préférences
  preferredMissionTypes: text('preferredMissionTypes').array(),

  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const memberships = pgTable('memberships', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id),
  tenantId: text('tenantId').notNull().references(() => tenants.id),

  // Adhésion
  startDate: timestamp('startDate').notNull(),
  endDate: timestamp('endDate').notNull(), // 1 an après
  status: text('status').default('active'), // 'pending', 'active', 'expired', 'cancelled'

  // Cotisation
  amount: integer('amount').notNull(), // Centimes (ex: 2000 = 20€)
  paymentMethod: text('paymentMethod'), // 'hello_asso', 'stripe', 'paypal', 'cash', 'check'
  paymentStatus: text('paymentStatus').default('pending'), // 'pending', 'paid', 'refunded'
  paidAt: timestamp('paidAt'),

  // HelloAsso
  helloAssoPaymentId: text('helloAssoPaymentId'),
  helloAssoFormUrl: text('helloAssoFormUrl'),

  createdAt: timestamp('createdAt').defaultNow(),
});

export const volunteerHours = pgTable('volunteer_hours', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id),
  tenantId: text('tenantId').notNull().references(() => tenants.id),

  // Heures
  date: timestamp('date').notNull(),
  hours: numeric('hours', { precision: 4, scale: 2 }).notNull(), // 2.5h

  // Contexte
  missionId: text('missionId').references(() => volunteerMissions.id),
  projectId: text('projectId').references(() => projects.id),
  description: text('description'),

  // Validation
  status: text('status').default('pending'), // 'pending', 'validated', 'rejected'
  validatedBy: text('validatedBy').references(() => users.id),
  validatedAt: timestamp('validatedAt'),

  createdAt: timestamp('createdAt').defaultNow(),
  createdBy: text('createdBy').references(() => users.id), // Auto ou admin
});

export const memberAchievements = pgTable('member_achievements', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('userId').notNull().references(() => users.id),
  tenantId: text('tenantId').notNull().references(() => tenants.id),

  type: text('type').notNull(),
  // 'hours_milestone', 'years_membership', 'special_recognition'

  // Détails
  title: text('title').notNull(), // "50 heures"
  description: text('description'),
  icon: text('icon'), // 🏅, 🌟, 💎

  // Seuil
  threshold: integer('threshold'), // 50 pour "50 heures"

  earnedAt: timestamp('earnedAt').defaultNow(),
});
```

### Fonctionnalités Clés

#### 1. Profil Membre Complet

```
┌─ Profil : Marie Dupont ───────────────────────────┐
│                                                    │
│ 📧 marie@example.com | 📱 06 12 34 56 78          │
│ 📍 Paris 75018 | Membre depuis 2022               │
│                                                    │
│ Clearance: 🟡 YELLOW (Coordinatrice)              │
│ Rôle: Coordinatrice Communication                 │
│                                                    │
│ 💼 Compétences:                                   │
│ [Graphisme] [Réseaux sociaux] [Photographie]     │
│                                                    │
│ ⏰ Disponibilités:                                │
│ ✅ Week-ends | ✅ Soirées | ❌ Vacances scolaires │
│ 🚫 Indispo: 15-20/08 (vacances)                   │
│                                                    │
│ 🚗 Logistique:                                    │
│ Permis B | Véhicule 5 places | Rayon 30km         │
│                                                    │
│ 📊 Statistiques 2025:                             │
│ ⏱️ 47 heures (objectif 50h)                       │
│ 🎯 12 missions effectuées                         │
│ 🏅 Badge "Bronze" débloqué                        │
│                                                    │
│ 💳 Cotisation 2025: ✅ Payée (20€)                │
│    Expire le: 31/08/2025                          │
│                                                    │
│ [✏️ Modifier profil] [📄 Attestation heures]      │
└────────────────────────────────────────────────────┘
```

#### 2. Gestion Cotisations + HelloAsso

**HelloAsso** = plateforme gratuite pour asso (0% frais obligatoires)

**Flow** :
```typescript
// 1. Admin crée campagne cotisation annuelle
await createMembershipCampaign({
  year: 2025,
  amount: 2000, // 20€
  helloAssoFormSlug: 'festival-asso-2025',
});

// 2. Membre clique "Renouveler cotisation"
// → Redirection vers HelloAsso
const helloAssoUrl = `https://www.helloasso.com/associations/festival-asso/adhesions/festival-asso-2025`;

// 3. Webhook HelloAsso notifie paiement
// POST /api/webhooks/helloasso
app.post('/api/webhooks/helloasso', async (req) => {
  const { data } = req.body;

  await db.update(memberships)
    .set({
      paymentStatus: 'paid',
      paidAt: new Date(),
      helloAssoPaymentId: data.id,
    })
    .where(eq(memberships.id, data.metadata.membershipId));

  // Email confirmation auto
  await sendEmail({
    to: member.email,
    subject: "Cotisation 2025 confirmée ✅",
    body: "Merci ! Votre adhésion est active jusqu'au 31/08/2026",
  });
});
```

**Alternative Stripe** (si besoin paiements récurrents) :
- Frais : 1.4% + 0.25€ par transaction
- Pour cotisation 20€ → frais 0.53€

#### 3. Suivi Heures Bénévolat

**Saisie** :
```
┌─ Déclarer heures bénévolat ───────────────────────┐
│ 📅 Date: [15/03/2025]                             │
│ ⏱️ Heures: [4.5]                                  │
│                                                    │
│ 📋 Mission (optionnel):                           │
│ [Sélectionner] → "Accueil Festival 2024"          │
│                                                    │
│ 🎯 Projet (optionnel):                            │
│ [Sélectionner] → "Communication Festival 2025"    │
│                                                    │
│ 📝 Description:                                   │
│ [Création affiches + posts réseaux sociaux]       │
│                                                    │
│ [💾 Enregistrer] → Status: En attente validation  │
└────────────────────────────────────────────────────┘
```

**Validation Admin** :
```
┌─ Heures à valider (3) ────────────────────────────┐
│ Marie - 4.5h - 15/03 - Communication              │
│ [✅ Valider] [❌ Rejeter]                          │
│                                                    │
│ Paul - 8h - 16/03 - Logistique                    │
│ [✅ Valider] [❌ Rejeter]                          │
└────────────────────────────────────────────────────┘
```

**Attestation Fiscale** (export PDF) :
```
┌────────────────────────────────────────────────────┐
│         ATTESTATION DE BÉNÉVOLAT                   │
│                                                    │
│ Association Festival XYZ                           │
│ SIRET: 123 456 789 00012                          │
│                                                    │
│ Atteste que Marie DUPONT                          │
│ a effectué 156 heures de bénévolat                │
│ du 01/01/2025 au 31/12/2025                       │
│                                                    │
│ Valorisation (base 15€/h) : 2 340€                │
│                                                    │
│ Fait pour valoir ce que de droit.                 │
│                                                    │
│ Le 31/12/2025                                      │
│ [Signature président]                             │
└────────────────────────────────────────────────────┘
```

#### 4. Gamification Sobre

**Badges par Heures** :
- 🥉 Bronze : 20 heures
- 🥈 Argent : 50 heures
- 🥇 Or : 100 heures
- 💎 Diamant : 200 heures

**Badges par Ancienneté** :
- 🌱 Nouveau (< 1 an)
- 🌿 Membre (1-3 ans)
- 🌳 Pilier (3-5 ans)
- 🏛️ Fondateur (> 5 ans)

**Reconnaissance Spéciale** (attribution manuelle) :
- 🌟 Membre d'honneur
- 🎖️ Coup de cœur CA
- 👏 Merci exceptionnel

**Dashboard Personnel** (privé, pas de classement public) :
```
┌─ Vos contributions 2025 ──────────────────────────┐
│                                                    │
│ ⏱️ Heures: 47 / 50 (objectif personnel)           │
│ ▓▓▓▓▓▓▓▓▓░ 94%                                    │
│                                                    │
│ 🎯 Missions: 12 effectuées                        │
│ 🏅 Badge: 🥉 Bronze (déblo🥈 Argent à 50h)       │
│                                                    │
│ 📈 Évolution:                                     │
│ [Graphique heures par mois]                       │
│                                                    │
│ 🎖️ Vos badges:                                    │
│ 🌿 Membre (2 ans) | 🥉 Bronze | 🎖️ Coup de cœur  │
│                                                    │
│ 💡 Prochain objectif: 3h pour débloquer Argent   │
└────────────────────────────────────────────────────┘
```

**Événement Annuel** : Pot de remerciement avec remise badges physiques (pin's)

---

## 💬 Communication Améliorée

### Objectifs
- Niveau Slack (UX/features)
- Threads, reactions, fichiers
- Recherche puissante
- Notifications intelligentes
- DM 1-to-1

### Features à Ajouter

#### 1. Threads (Fils de discussion)

```typescript
export const messageThreads = pgTable('message_threads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  parentMessageId: text('parentMessageId').notNull().references(() => messages.id),
  channelId: text('channelId').notNull().references(() => channels.id),

  replyCount: integer('replyCount').default(0),
  lastReplyAt: timestamp('lastReplyAt'),
  lastReplyBy: text('lastReplyBy').references(() => users.id),
});

// UI
┌─ Message Principal ───────────────────────────────┐
│ Paul • 15:23                                      │
│ On valide la sono pour le festival ?             │
│                                                    │
│ 💬 3 réponses | Dernière: Marie il y a 5 min     │
│ [Voir fil →]                                      │
└────────────────────────────────────────────────────┘

// Clic "Voir fil"
┌─ Thread ──────────────────────────────────────────┐
│ 💬 Paul • 15:23                                   │
│ On valide la sono pour le festival ?             │
│ ├─ Marie • 15:25                                  │
│ │  Oui, j'ai 3 devis comparés                    │
│ ├─ Sophie • 15:30                                 │
│ │  Le devis 2 est le meilleur rapport qualité    │
│ └─ Paul • 15:35                                   │
│    OK je lance commande 👍                        │
│                                                    │
│ [💬 Répondre dans le fil...]                     │
└────────────────────────────────────────────────────┘
```

#### 2. Reactions (Emoji)

```typescript
export const messageReactions = pgTable('message_reactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  messageId: text('messageId').notNull().references(() => messages.id),
  userId: text('userId').notNull().references(() => users.id),
  emoji: text('emoji').notNull(), // '👍', '❤️', '😂', '🎉'
  createdAt: timestamp('createdAt').defaultNow(),
});

// UI
┌─ Message ─────────────────────────────────────────┐
│ Marie • 14:20                                     │
│ Le festival est confirmé pour le 15 juin ! 🎉    │
│                                                    │
│ 🎉 12  ❤️ 8  👏 5  [+ Ajouter réaction]          │
└────────────────────────────────────────────────────┘
```

#### 3. Fichiers Partagés

```typescript
export const messageAttachments = pgTable('message_attachments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  messageId: text('messageId').notNull().references(() => messages.id),

  fileName: text('fileName').notNull(),
  fileSize: integer('fileSize'),
  mimeType: text('mimeType'),
  storageUrl: text('storageUrl').notNull(),

  // Preview
  thumbnailUrl: text('thumbnailUrl'), // Pour images

  createdAt: timestamp('createdAt').defaultNow(),
});

// UI
┌─ Message ─────────────────────────────────────────┐
│ Paul • 16:45                                      │
│ Voici les devis sono                              │
│                                                    │
│ 📎 devis-sono-1.pdf (245 KB) [Télécharger]       │
│ 📎 devis-sono-2.pdf (189 KB) [Télécharger]       │
│ 🖼️ [Aperçu image plan-scene.jpg]                 │
└────────────────────────────────────────────────────┘
```

#### 4. Recherche Avancée

```typescript
// API: /api/communication/search
async function searchMessages(query: string, filters: SearchFilters) {
  return await db
    .select()
    .from(messages)
    .where(
      and(
        sql`to_tsvector('french', content) @@ to_tsquery('french', ${query})`,
        filters.channelId ? eq(messages.channelId, filters.channelId) : undefined,
        filters.userId ? eq(messages.userId, filters.userId) : undefined,
        filters.dateFrom ? gte(messages.createdAt, filters.dateFrom) : undefined,
      )
    );
}

// UI
┌─ Recherche ───────────────────────────────────────┐
│ 🔍 [budget sono____________]                      │
│                                                    │
│ Filtres:                                          │
│ Channel: [Logistique ▼]                           │
│ De: [Marie ▼]                                     │
│ Date: [01/01/2025] à [31/12/2025]                 │
│                                                    │
│ Résultats (3):                                    │
│ ────────────────────────────────────────────────  │
│ 📍 #logistique | Paul • 15/03                     │
│ On valide la sono pour le festival ?             │
│ Budget: 2500€                                     │
│                                                    │
│ 📍 #budget | Marie • 20/03                        │
│ Ligne "Sono" approuvée à 2500€                   │
│                                                    │
│ [Voir plus →]                                     │
└────────────────────────────────────────────────────┘
```

#### 5. Notifications Intelligentes

```typescript
export const userNotificationSettings = pgTable('user_notification_settings', {
  userId: text('userId').primaryKey().references(() => users.id),

  // Par canal
  emailEnabled: boolean('emailEnabled').default(true),
  pushEnabled: boolean('pushEnabled').default(true),

  // Fréquence
  emailDigest: text('emailDigest').default('realtime'),
  // 'realtime', 'hourly', 'daily', 'never'

  // Filtres
  onlyMentions: boolean('onlyMentions').default(false),
  onlyDMs: boolean('onlyDMs').default(false),

  // Do Not Disturb
  dndEnabled: boolean('dndEnabled').default(false),
  dndStart: text('dndStart'), // "22:00"
  dndEnd: text('dndEnd'), // "08:00"

  mutedChannels: text('mutedChannels').array(),
});

// UI Préférences
┌─ Notifications ───────────────────────────────────┐
│ 📧 Email: ✅ Activé                               │
│    Fréquence: [Temps réel ▼]                     │
│                                                    │
│ 🔔 Push (mobile): ✅ Activé                       │
│                                                    │
│ 🔕 Ne pas déranger:                               │
│    ✅ De 22h00 à 08h00                            │
│                                                    │
│ 🎯 Notifier uniquement pour:                      │
│    ☐ Mentions (@moi)                              │
│    ☐ Messages privés                              │
│                                                    │
│ 🔇 Channels silencieux:                           │
│    [Sélectionner...] (#general, #random)          │
└────────────────────────────────────────────────────┘
```

#### 6. Messages Privés (DM)

```typescript
// Créer channel privé 1-to-1 automatiquement
async function createOrGetDM(user1Id: string, user2Id: string) {
  // Chercher channel DM existant
  const existing = await db.query.channels.findFirst({
    where: and(
      eq(channels.type, 'direct'),
      // Members = user1 + user2
    ),
  });

  if (existing) return existing;

  // Créer nouveau
  const channel = await db.insert(channels).values({
    type: 'direct',
    name: `dm-${user1Id}-${user2Id}`,
    slug: `dm-${user1Id}-${user2Id}`,
  });

  // Ajouter membres
  await db.insert(channelMembers).values([
    { channelId: channel.id, userId: user1Id },
    { channelId: channel.id, userId: user2Id },
  ]);

  return channel;
}

// UI
┌─ Messages Privés ─────────────────────────────────┐
│ 👤 Marie Dupont                                   │
│    Dernière: "OK pour demain" • il y a 2h        │
│                                                    │
│ 👤 Paul Martin                                    │
│    Dernière: "Le budget est validé" • hier       │
│                                                    │
│ [+ Nouveau message]                               │
└────────────────────────────────────────────────────┘
```

---

## 🔔 Automatisations

### 1. Alertes Deadlines

```typescript
// Cron job quotidien (Vercel Cron ou similaire)
export async function checkDeadlines() {
  const now = new Date();

  // Tâches projet
  const upcomingTasks = await db.query.tasks.findMany({
    where: and(
      isNull(tasks.completedAt),
      // Deadline dans les 7 jours
      between(tasks.dueDate, now, addDays(now, 7))
    ),
  });

  for (const task of upcomingTasks) {
    const daysUntil = differenceInDays(task.dueDate, now);

    if (daysUntil === 7) {
      await sendNotification({
        to: task.assignees,
        title: `📅 Deadline dans 7 jours`,
        body: `"${task.title}" - ${format(task.dueDate, 'dd/MM/yyyy')}`,
        priority: 'normal',
      });
    }

    if (daysUntil === 1) {
      await sendNotification({
        to: task.assignees,
        title: `⚠️ URGENT - Deadline demain`,
        body: `"${task.title}"`,
        priority: 'high',
      });
    }

    if (daysUntil === 0) {
      await sendNotification({
        to: task.assignees,
        title: `🚨 Deadline AUJOURD'HUI`,
        body: `"${task.title}"`,
        priority: 'critical',
        // Escalade si pas complété à 18h
        escalateTo: coordinatorIds,
      });
    }
  }

  // Subventions
  const upcomingGrants = await db.query.grants.findMany({
    where: between(grants.deadline, now, addDays(now, 60)),
  });

  // Alertes J-60, J-30, J-7
  // ...
}
```

### 2. Rappels Réunions

```typescript
// Cron jobs multiples
// J-7
export async function sendMeetingReminders() {
  const in7Days = addDays(new Date(), 7);

  const upcomingMeetings = await db.query.meetings.findMany({
    where: and(
      eq(meetings.status, 'convocation_sent'),
      between(meetings.date, startOfDay(in7Days), endOfDay(in7Days))
    ),
  });

  for (const meeting of upcomingMeetings) {
    const participants = await getParticipants(meeting.id);
    const agenda = await getAgenda(meeting.id);
    const docs = await getMeetingDocuments(meeting.id);

    await sendEmail({
      to: participants.map(p => p.email),
      subject: `📅 Rappel ${meeting.type.toUpperCase()} - ${format(meeting.date, 'dd/MM/yyyy')}`,
      template: 'meeting-reminder-j7',
      data: {
        meeting,
        agenda,
        docs,
        rsvpLink: `${baseUrl}/meetings/${meeting.id}/rsvp`,
      },
    });
  }
}

// J-1 (SMS optionnel via Twilio/similaire)
export async function sendMeetingRemindersSMS() {
  const tomorrow = addDays(new Date(), 1);
  // ...

  await sendSMS({
    to: participants.map(p => p.phone),
    body: `Rappel: ${meeting.type} demain ${format(meeting.date, 'HH:mm')} - ${meeting.location}`,
  });
}
```

### 3. Relances Cotisations

```typescript
// Cron quotidien
export async function sendMembershipRenewals() {
  const in30Days = addDays(new Date(), 30);

  const expiringMemberships = await db.query.memberships.findMany({
    where: and(
      eq(memberships.status, 'active'),
      between(memberships.endDate, startOfDay(in30Days), endOfDay(in30Days))
    ),
  });

  for (const membership of expiringMemberships) {
    const user = await getUser(membership.userId);

    await sendEmail({
      to: user.email,
      subject: `Renouvellement adhésion 2026`,
      template: 'membership-renewal',
      data: {
        userName: user.name,
        expiryDate: membership.endDate,
        renewalLink: `${baseUrl}/memberships/renew/${membership.id}`,
        amount: membership.amount / 100, // 20€
      },
    });
  }

  // Relances J-15, J-7 similaires
}
```

---

## 🏗️ Architecture Technique

### Stack Confirmé

**Frontend** :
- Next.js 16 (App Router + Turbopack)
- React Server Components
- shadcn/ui + Tailwind CSS
- PWA (next-pwa)

**Backend** :
- Next.js API Routes
- Drizzle ORM + PostgreSQL (Neon)
- Clerk Auth
- Supabase (Realtime + Storage)

**IA** :
- Anthropic Claude API (Sonnet 3.5)

**Paiements** :
- HelloAsso (gratuit, prioritaire)
- Stripe (fallback, frais ~1.5%)

**Emails** :
- Resend (gratuit 100/j) ou SendGrid

**SMS** (optionnel) :
- Twilio (pay-as-you-go, ~0.05€/SMS)

### Nouveau : Stockage Documents

**Option 1 : Supabase Storage** ✅ Recommandé
- Gratuit : 1 GB
- Intégré avec auth Supabase existante
- Policies RLS pour sécurité

**Option 2 : Vercel Blob**
- Gratuit : 1 GB
- Très simple (1 ligne code)
- Pas besoin config RLS

**Option 3 : Uploadthing**
- Gratuit : 2 GB
- Spécialisé Next.js
- Bonne DX

**Choix** : **Supabase Storage** (déjà utilisé pour realtime)

### Architecture Clearance Modules

```
User Login
    ↓
getUserClearance(userId, tenantId) → 3 (YELLOW)
    ↓
getUserModules(tenantId, 3) → [Communication, Volunteers, Documents, Projects, Meetings]
    ↓
Dashboard affiche modules accessibles
    ↓
Click "Projets" → Vérifie clearance ≥ 3 → ✅ Accès
```

---

## 📅 Plan Implémentation

### Phase 3.5 : Système Invitation & Membres (1-2 semaines)
1. Améliorer invitations (clearance + email)
2. Page gestion membres
3. Profils complets
4. Cotisations HelloAsso
5. Suivi heures bénévolat

### Phase 4 : Module Documents (1-2 semaines)
1. Arborescence dossiers
2. Upload Supabase Storage
3. Workflow validation
4. Templates
5. Signatures simples
6. Recherche

### Phase 5 : Module Projets (1-2 semaines)
1. CRUD projets
2. Vue Kanban (dnd-kit)
3. Tâches multi-assignés
4. Vue calendrier
5. Jalons
6. Liens budget/docs

### Phase 6 : Module Réunions (2 semaines)
1. CRUD réunions
2. Workflow convocation
3. Ordre du jour collaboratif
4. PV (éditeur + upload + IA)
5. Votes (physique + async)
6. Délégations

### Phase 7 : Communication Pro (1 semaine)
1. Threads
2. Reactions
3. Fichiers
4. Recherche
5. DM
6. Notifications

### Phase 8 : Automatisations (3 jours)
1. Cron jobs Vercel
2. Alertes deadlines
3. Rappels réunions
4. Relances cotisations

---

## ❓ Questions Finales Avant Implémentation

### Priorités Absolues
1. **Par quoi commencer en PREMIER** ?
   - A) Invitations + Membres
   - B) Documents
   - C) Projets
   - D) Réunions

### Décisions Techniques
2. **Stockage docs** : Supabase Storage OK ou préférence Vercel Blob ?
3. **SMS J-1 réunions** : Budget OK (~5€/mois pour 100 SMS) ou juste email/push ?
4. **IA PV** : Générer systématiquement ou juste option "Aide IA" ?
5. **Gamification** : Activer dès le début ou plus tard ?

### Scope MVP
6. **Features à reporter** si besoin gagner temps :
   - Threads communication ?
   - Jalons projets ?
   - Synthèse IA multi-PV ?
   - Délégation votes ?

**Réponds par les lettres/numéros, je commence ensuite le développement ! 🚀**
