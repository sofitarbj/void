# VOID IDE — Plan d'Implémentation des Fonctionnalités Manquantes

> Document technique de planification — Mai 2025
> Analyse de l'existant + Roadmap pour un IDE agentique fonctionnel et complet

---

## 0. État des lieux — Ce qui EXISTE déjà

| Fonctionnalité | Statut | Fichiers concernés |
|---|---|---|
| Chat sidebar + historique | ✅ Fonctionnel | `SidebarChat.tsx`, `chatThreadService.ts` |
| @ mentions (fichiers/dossiers) | ✅ Fonctionnel | `inputs.tsx` (VoidInputBox2) |
| Sélection de modèle | ✅ Fonctionnel | `ModelDropdown`, `voidSettingsService.ts` |
| Mode agent/gather/normal | ✅ Fonctionnel | `prompts.ts`, `chatThreadService.ts` |
| 14 outils builtin | ✅ Fonctionnel | `toolsService.ts`, `prompts.ts` |
| Approbation outils | ✅ Fonctionnel | `chatThreadService.ts` (_runToolCall) |
| Diff inline (accept/reject) | ✅ Fonctionnel | `editCodeService.ts`, `CommandBarInChat` |
| Budget service | ✅ Fonctionnel | `voidBudgetService.ts` |
| Memory service (KI, rules) | ✅ Fonctionnel | `voidMemoryService.ts` |
| Terminal tools | ✅ Fonctionnel | `terminalToolService.ts` |
| Status indicator (Running/Done) | ✅ Fonctionnel | `CommandBarInChat` (StatusIndicator) |
| MCP support | ✅ Fonctionnel | `mcpService.ts` |
| Retries (3x, 2.5s delay) | ✅ Basique | `chatThreadService.ts` |
| Planning prompt (instructions) | ✅ Instructions seulement | `prompts.ts` (importantDetails) |
| Conversation summary | ✅ Basique (dernier msg) | `_saveThreadSummary()` |

---

## 1. Ce qui MANQUE — Fonctionnalités à implémenter

### 🔴 Priorité HAUTE

| # | Fonctionnalité | Description | Complexité |
|---|---|---|---|
| F1 | **Animation live diff (+/- lignes)** | Afficher en temps réel le compteur de lignes ajoutées/supprimées pendant l'édition | Moyenne |
| F2 | **Images en pièces jointes** | Support multimodal : upload d'images, encodage base64, envoi au LLM | Haute |
| F3 | **Entrée vocale + transcription** | Bouton micro, oscillation audio, transcription → texte dans input | Haute |
| F4 | **Task list visible (suivi)** | L'IA crée/maintient une checklist visible dans l'UI pendant le travail | Moyenne |
| F5 | **Drag & drop depuis Explorer** | Glisser un fichier de l'arborescence VS Code vers l'input chat | Faible |

### 🟡 Priorité MOYENNE

| # | Fonctionnalité | Description | Complexité |
|---|---|---|---|
| F6 | **IA pose des questions mid-task** | L'agent peut poser des questions avec options de réponse pré-définies | Moyenne |
| F7 | **Messages en queue pendant travail** | L'utilisateur écrit pendant que l'IA travaille, mis en attente et injecté | Moyenne |
| F8 | **Terminal interactif visible** | Voir le terminal de l'IA en direct, pouvoir y saisir (mot de passe, etc.) | Haute |
| F9 | **Plan d'implémentation (validation)** | Pour tâches complexes : créer plan → attendre validation → exécuter | Faible (prompt only) |
| F10 | **Clé API séparée pour agent gratuit** | Configurer une clé API distincte pour le modèle free (Gemma 4) | Faible |

---

## 2. Plan d'implémentation détaillé

---

### F1 — Animation live diff (+/- lignes)

**Problème actuel :** Quand l'agent édite un fichier, l'UI affiche juste "Editing..." sans feedback visuel du volume de changements.

**Solution :** Ajouter un compteur live `+N / -M` lignes qui s'actualise pendant le streaming du diff.

**Fichiers à modifier :**
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Composant `EditToolSoFar` (ligne ~3131)
- `browser/editCodeService.ts` — Émettre un event avec les compteurs de lignes

**Implémentation :**
1. Dans `editCodeService.ts`, lors du parsing des SEARCH/REPLACE blocks, compter les lignes ajoutées/supprimées et émettre un event `onDidChangeDiffStats`.
2. Créer un composant `DiffStatsIndicator` dans la sidebar :
   ```tsx
   <span className="text-green-500">+{linesAdded}</span>
   <span className="text-red-500">-{linesRemoved}</span>
   ```
3. Connecter via l'event au composant React dans `EditToolSoFar`.

**Estimation :** ~2h

---

### F2 — Images en pièces jointes (multimodal)

**Problème actuel :** Aucun support d'upload d'images. Les modèles multimodaux (Gemini, Claude, GPT-4) supportent pourtant les images.

**Solution :** Ajouter un bouton d'upload + drag&drop d'images dans le chat input, encoder en base64, et les inclure dans le message user.

**Fichiers à créer :**
- `browser/react/src/sidebar-tsx/ImageUpload.tsx` — Composant UI (bouton + preview)

**Fichiers à modifier :**
- `common/chatThreadServiceTypes.ts` — Ajouter `images?: { base64: string; mimeType: string }[]` au type `UserMessage`
- `browser/chatThreadService.ts` — Passer les images dans `addUserMessageAndStreamResponse()`
- `browser/convertToLLMMessageService.ts` — Convertir les images en format multimodal (Anthropic: content blocks, OpenAI: image_url)
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Intégrer le composant d'upload dans `VoidChatArea`

**Implémentation :**
1. Ajouter le type `ChatImageAttachment` dans `chatThreadServiceTypes.ts`.
2. Créer `ImageUpload.tsx` avec :
   - Bouton icône (paperclip/image)
   - Input file hidden (`accept="image/*"`)
   - Preview thumbnail avant envoi
   - Conversion en base64 via `FileReader`
3. Modifier `_chatMessagesToSimpleMessages()` pour inclure les images dans le content (format multimodal).
4. Adapter `prepareMessages_anthropic_tools` et `prepareMessages_openai_tools` pour le format vision.

**Estimation :** ~4h

---

### F3 — Entrée vocale + transcription

**Problème actuel :** Pas de support vocal. L'utilisateur doit tout taper.

**Solution :** Bouton micro dans la barre input, enregistrement via Web Audio API, transcription via l'API du modèle ou Whisper, injection du texte transcrit dans le textarea.

**Fichiers à créer :**
- `browser/react/src/sidebar-tsx/VoiceInput.tsx` — Composant avec oscillation + boutons contrôle

**Fichiers à modifier :**
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Intégrer `VoiceInput` dans `VoidChatArea`

**Implémentation :**
1. Créer `VoiceInput.tsx` :
   - État : `idle | recording | processing`
   - Utiliser `navigator.mediaDevices.getUserMedia({ audio: true })`
   - `AudioContext` + `AnalyserNode` pour l'oscillation visuelle (canvas ou SVG animé)
   - Enregistrement via `MediaRecorder` (format webm/opus)
2. Oscillation :
   - Dessiner une barre animée (waveform) qui réagit au volume micro en temps réel
   - Quand silence → ligne plate
   - Quand parole → oscillation verte
3. Transcription :
   - Option A : Utiliser `Web Speech API` (gratuit, local) via `SpeechRecognition`
   - Option B : Envoyer l'audio au modèle multimodal (Gemini supporte l'audio)
   - Le texte transcrit s'affiche dans le textarea pour review/modification
4. Boutons : 🎤 Start | ⏹️ Stop | ✓ Valider (insère le texte)

**Estimation :** ~5h

---

### F4 — Task list visible (suivi du travail)

**Problème actuel :** L'IA peut créer un `implementation_plan.md` mais il n'y a pas de suivi visuel dans l'UI.

**Solution :** Composant `TaskProgress` affiché dans la sidebar qui montre une checklist maintenue par l'IA.

**Fichiers à créer :**
- `browser/react/src/sidebar-tsx/TaskProgress.tsx` — Composant checklist

**Fichiers à modifier :**
- `common/chatThreadServiceTypes.ts` — Ajouter `taskList?: TaskItem[]` au thread state
- `browser/chatThreadService.ts` — API pour set/update la task list
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Afficher le composant au-dessus du chat

**Implémentation :**
1. Type `TaskItem = { id: string; text: string; status: 'pending' | 'in_progress' | 'done' }`
2. Le composant affiche la liste avec des cases à cocher visuelles (vert = done, orange = en cours, gris = pending)
3. L'IA met à jour la liste via un mécanisme interne (parser les markdown checkboxes dans sa réponse ou via un outil dédié)
4. L'utilisateur peut voir la progression en temps réel

**Estimation :** ~3h

---

### F5 — Drag & drop depuis Explorer

**Problème actuel :** Le glisser-déposer d'un fichier depuis l'Explorer VS Code vers l'input chat ne fonctionne pas.

**Solution :** Écouter les events `dragover`/`drop` sur le `VoidChatArea` et résoudre le chemin du fichier droppé.

**Fichiers à modifier :**
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Ajouter drag handlers sur `VoidChatArea`

**Implémentation :**
1. Ajouter `onDragOver` (prevent default) et `onDrop` sur le div de `VoidChatArea`.
2. Dans `onDrop`, extraire le URI du fichier depuis `e.dataTransfer`.
3. Créer une `StagingSelectionItem` de type `File` et l'ajouter aux sélections.
4. Feedback visuel : bordure highlight pendant le drag.

**Estimation :** ~1h

---

### F6 — IA pose des questions mid-task

**Problème actuel :** L'agent n'a pas de mécanisme UI dédié pour poser des questions avec options.

**Solution :** Un type de message spécial `question` avec des boutons de réponse pré-définis.

**Fichiers à modifier :**
- `common/chatThreadServiceTypes.ts` — Ajouter un rôle `question` ou un champ `options` au message assistant
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Composant `QuestionBubble` avec boutons

**Implémentation :**
1. Quand l'IA écrit un format spécial (ex: `[QUESTION: ...] [OPTION_1: ...] [OPTION_2: ...]`), parser et afficher comme boutons.
2. Au clic sur un bouton, injecter la réponse comme message user et continuer la boucle.
3. Alternative : l'IA utilise un tool `ask_user_question` (déjà dans le blueprint) qui suspend la boucle.

**Estimation :** ~3h

---

### F7 — Messages en queue pendant le travail

**Problème actuel :** L'utilisateur ne peut pas écrire pendant que l'IA travaille (le submit est bloqué quand `isRunning`).

**Solution :** Permettre l'écriture pendant le travail, mettre le message en queue, et l'injecter au prochain tour.

**Fichiers à modifier :**
- `browser/chatThreadService.ts` — Ajouter une queue de messages pending
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Débloquer le textarea pendant `isRunning`

**Implémentation :**
1. Ajouter `pendingUserMessages: string[]` dans le thread state.
2. Si l'utilisateur submit pendant que `isRunning`, ajouter à la queue au lieu de bloquer.
3. Dans la `_runLoop`, avant chaque nouveau tour, vérifier la queue et injecter comme contexte additionnel.
4. Afficher un badge "1 message en attente" dans l'UI.

**Estimation :** ~2h

---

### F8 — Terminal interactif visible

**Problème actuel :** Le terminal de l'IA est invisible. Si une commande demande un input (mot de passe), l'utilisateur ne peut pas intervenir.

**Solution :** Afficher le terminal de l'IA dans le panel terminal VS Code + permettre l'interaction.

**Fichiers à modifier :**
- `browser/terminalToolService.ts` — Exposer le terminal persistant dans le panel UI
- `browser/chatThreadService.ts` — Quand un terminal attend un input, passer en mode `awaiting_user`

**Implémentation :**
1. Les terminaux persistants créés par l'agent sont déjà des vrais terminaux VS Code.
2. Ajouter un lien/bouton dans le chat "Voir le terminal" qui focus le terminal dans le panel bas.
3. Quand le terminal détecte un prompt d'input (heuristique : pas de sortie pendant > 5s après commande), émettre un event.
4. L'UI affiche "Le terminal attend une saisie" avec un bouton pour ouvrir le terminal.

**Estimation :** ~3h

---

### F9 — Plan d'implémentation (validation obligatoire)

**Problème actuel :** Les instructions de planning sont dans le prompt mais il n'y a pas de mécanisme UI de validation.

**Solution :** Quand l'IA crée un `implementation_plan.md`, afficher un composant de validation dans le chat.

**Déjà partiellement implémenté :** Le prompt dit à l'agent de créer un plan et d'attendre. Le problème est qu'il n'y a pas de gate UI.

**Implémentation :**
1. Détecter quand l'agent crée un fichier `*plan*` ou `*task*`.
2. Afficher un composant "Plan proposé" avec aperçu + boutons Approuver/Rejeter.
3. Au clic "Approuver", envoyer un message user "proceed" pour débloquer la boucle.

**Estimation :** ~2h

---

### F10 — Clé API séparée pour agent gratuit

**Problème actuel :** Un seul set de clés par provider. Si on veut un modèle gratuit sur OpenRouter, on utilise la même clé.

**Solution :** C'est déjà supporté ! OpenRouter utilise une seule clé pour tous les modèles (free inclus). Pas de modification nécessaire.

**Clarification :** Les modèles `:free` sur OpenRouter (Gemma 4, etc.) sont accessibles avec la même clé API OpenRouter. Aucune configuration supplémentaire n'est requise — il suffit de sélectionner le modèle `google/gemma-4-26b-a4b-it:free` dans le dropdown.

**Estimation :** 0h (déjà fonctionnel)

---

### 🔴 Priorité HAUTE (identifiés depuis IDE_FINAL.md)

| # | Fonctionnalité | Description | Complexité |
|---|---|---|---|
| F11 | **Système de Skills** | Compétences spécialisées invocables par l'IA (frontend-design, clean-code, etc.) | Haute |
| F12 | **Outil `todo_list`** | Outil natif que l'IA utilise pour gérer ses tâches (alimente F4) | Moyenne |
| F13 | **Outil `ask_user_question`** | Outil permettant à l'IA de poser des questions structurées avec options | Moyenne |

### 🟡 Priorité MOYENNE (identifiés depuis IDE_FINAL.md)

| # | Fonctionnalité | Description | Complexité |
|---|---|---|---|
| F14 | **Workflows (.voidworkflows/)** | Scripts Markdown déclenchables par slash commands | Moyenne |
| F15 | **`send_command_input`** | Envoyer du texte à un terminal bloquant (mot de passe, etc.) | Faible |
| F16 | **`search_web` / `read_url_content`** | Recherche internet + lecture de pages web | Haute |

---

### F11 — Système de Skills

**Problème actuel :** L'IA n'a aucun mécanisme pour charger dynamiquement des instructions spécialisées selon le domaine. Chaque tâche est traitée avec le même prompt généraliste.

**Référence :** `IDE_FINAL.md` §7.5 — L'outil `skill` invoque des compétences spécialisées (frontend-design, clean-architecture, 12-factor-app, etc.)

**Solution :** Créer un système de Skills stockés localement (fichiers .md) que l'IA peut invoquer on-demand via un outil `invoke_skill`. Le contenu du skill est injecté dans le contexte pour la durée de la tâche.

**Fichiers à créer :**
- `common/skillServiceTypes.ts` — Types `SkillDefinition`, `SkillMetadata`
- `browser/skillService.ts` — `ISkillService` : chargement, listing, invocation
- Dossier `skills/` à la racine ou dans `.void/skills/` — Fichiers markdown des skills

**Fichiers à modifier :**
- `common/prompt/prompts.ts` — Ajouter l'outil `invoke_skill` dans `builtinTools`
- `browser/toolsService.ts` — Implémenter `callTool['invoke_skill']` et `stringOfResult['invoke_skill']`
- `browser/void.contribution.ts` — Enregistrer le service

**Architecture d'un skill :**
```markdown
---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality.
triggers: ["build web component", "create page", "design UI", "landing page", "dashboard"]
---

## Instructions

Quand tu crées des interfaces frontend :
1. Utilise TailwindCSS + shadcn/ui pour les composants
2. Applique un design premium (gradients, micro-animations, typographies modernes)
3. ...
```

**Implémentation :**
1. `SkillService` scanne les dossiers de skills au démarrage (bundled + user-defined dans `.void/skills/`)
2. L'outil `invoke_skill` prend un paramètre `skill_name` et retourne le contenu du skill
3. Le contenu est injecté dans le contexte via `tool_result` (comme un fichier lu)
4. Le service peut aussi **auto-trigger** des skills en analysant la requête utilisateur contre les `triggers` déclarés
5. L'utilisateur peut créer ses propres skills dans `.void/skills/`

**Skills bundled par défaut :**
- `frontend-design` — UI premium, composants React/Tailwind
- `clean-code` — Principes de code propre
- `debugging` — Protocole de debug structuré
- `api-design` — RESTful, GraphQL best practices
- `database` — SQL, ORM, migrations
- `security` — OWASP, validation, sanitization
- `performance` — Optimisation, lazy loading, caching
- `testing` — Unit tests, integration, TDD

**Estimation :** ~6h

---

### F12 — Outil `todo_list` (gestion des tâches par l'IA)

**Problème actuel :** L'IA ne peut pas créer/maintenir une liste de tâches structurée accessible à l'UI.

**Référence :** `IDE_FINAL.md` §7.5 — Outil `todo_list` avec statuts pending/in_progress/completed.

**Solution :** Nouvel outil builtin `todo_list` qui alimente le composant `TaskProgress` (F4).

**Fichiers à modifier :**
- `common/toolsServiceTypes.ts` — Ajouter `todo_list` dans `BuiltinToolCallParams`
- `common/prompt/prompts.ts` — Ajouter la définition de l'outil
- `browser/toolsService.ts` — Implémenter `callTool['todo_list']`
- `common/chatThreadServiceTypes.ts` — Ajouter `taskList` au thread state

**Paramètres de l'outil :**
```typescript
todo_list: {
  todos: Array<{
    id: string;
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
  }>
}
```

**Comportement :** Quand l'IA appelle `todo_list`, ça remplace la liste de tâches du thread courant. Le composant React (F4) se met à jour en temps réel.

**Estimation :** ~2h

---

### F13 — Outil `ask_user_question`

**Problème actuel :** L'IA n'a pas de moyen structuré de poser une question avec des options de réponse.

**Référence :** `IDE_FINAL.md` §5 — L'IA doit poser des questions structurées via `ask_user_question`.

**Solution :** Nouvel outil builtin qui suspend la boucle agent et affiche une question avec boutons.

**Fichiers à modifier :**
- `common/toolsServiceTypes.ts` — Ajouter `ask_user_question` dans `BuiltinToolCallParams`
- `common/prompt/prompts.ts` — Ajouter la définition de l'outil
- `browser/toolsService.ts` — Implémenter (suspend la boucle, attend réponse)
- `browser/react/src/sidebar-tsx/SidebarChat.tsx` — Composant `QuestionBubble`

**Paramètres de l'outil :**
```typescript
ask_user_question: {
  question: string;
  options: Array<{ label: string; description: string }>;  // max 4 options
  allow_free_text: boolean;
}
```

**Comportement :**
1. L'IA appelle `ask_user_question` → la boucle se suspend (comme `awaiting_user`)
2. L'UI affiche la question avec des boutons pour chaque option
3. L'utilisateur clique un bouton OU tape une réponse libre
4. La réponse est injectée comme `tool_result` et la boucle continue

**Estimation :** ~3h

---

### F14 — Workflows (slash commands)

**Problème actuel :** Pas de système de workflows réutilisables.

**Référence :** `IDE_FINAL.md` §8.2 — Fichiers Markdown dans `.void/workflows/` déclenchables par slash.

**Solution :** Scanner `.void/workflows/*.md` et les proposer comme slash commands dans l'input.

**Fichiers à créer :**
- `browser/workflowService.ts` — `IWorkflowService` : scan, parse, execute

**Fichiers à modifier :**
- `browser/react/src/util/inputs.tsx` — Détecter `/` dans l'input pour ouvrir un menu de workflows
- `browser/chatThreadService.ts` — Exécuter un workflow (séquence d'étapes)

**Format d'un workflow :**
```markdown
---
description: Deploy the application to production
---
1. Run `npm run build`
2. Run `npm run test`
// turbo
3. Run `npm run deploy`
```

**Estimation :** ~4h

---

### F15 — `send_command_input` (interaction terminal bloquant)

**Problème actuel :** Si un terminal attend un input (mot de passe sudo, confirmation y/n), l'IA ne peut pas répondre automatiquement et l'utilisateur non plus (terminal invisible).

**Solution :** Ajouter un outil `send_command_input` qui écrit dans le stdin d'un terminal persistant.

**Fichiers à modifier :**
- `common/toolsServiceTypes.ts` — Ajouter `send_command_input`
- `common/prompt/prompts.ts` — Définition de l'outil
- `browser/toolsService.ts` — Implémenter via `terminalToolService`
- `browser/terminalToolService.ts` — Méthode `sendInput(terminalId, text)`

**Paramètres :**
```typescript
send_command_input: {
  persistent_terminal_id: string;
  input: string;  // texte à envoyer (+ \n implicite)
}
```

**Estimation :** ~1.5h

---

### F16 — `search_web` / `read_url_content`

**Problème actuel :** L'IA ne peut pas chercher sur internet ni lire des pages web.

**Référence :** `IDE_FINAL.md` §7.4 — Outils web (search, read URL, browser preview).

**Solution :** Implémenter `search_web` (via API SerpAPI/Brave/DuckDuckGo) et `read_url_content` (fetch + HTML→text).

**Fichiers à créer :**
- `electron-main/webSearchChannel.ts` — Service main process pour les requêtes web

**Fichiers à modifier :**
- `common/toolsServiceTypes.ts` — Ajouter les outils
- `common/prompt/prompts.ts` — Définitions
- `browser/toolsService.ts` — Implémentation côté browser (IPC vers main)
- `electron-main/sendLLMMessageChannel.ts` — Ajouter le channel web

**Note :** Nécessite une clé API externe (SerpAPI, Brave Search, ou scraping direct). Peut être optionnel si pas de clé configurée.

**Estimation :** ~5h

---

## 3. Explication du routage des modèles

### Comment ça fonctionne (pour l'utilisateur)

Le **Model Router** (`modelRouterService.ts`) fonctionne ainsi :

1. **Mode manuel (par défaut)** : L'utilisateur choisit son modèle dans le dropdown. Ce modèle est utilisé pour TOUT.

2. **Mode auto-routage (optionnel, à activer)** : Si `modelRouter.enabled = true` dans les settings :
   - L'utilisateur choisit un **modèle principal** (ex: Claude Sonnet 4.6 pour les tâches complexes)
   - Et un **modèle economy** (ex: DeepSeek V4 Flash pour les tâches simples)
   - Le router analyse automatiquement la complexité de chaque requête
   - Pour "bonjour" → utilise le modèle economy (quasi gratuit)
   - Pour "refactore tout le module auth" → utilise le modèle principal

3. **Pourquoi choisir un modèle alors ?** Le dropdown reste le choix **par défaut**. Le router n'intervient que si activé et ne fait que downgrader vers un modèle moins cher pour les tâches simples. L'utilisateur garde toujours le contrôle.

---

## 4. Ordre d'implémentation recommandé

```
Semaine 1 — Fondations outils :
  ├── F5   Drag & drop (1h) — Quick win
  ├── F12  Outil todo_list (2h) — Fondation pour F4
  ├── F4   Task list visible (3h) — Suivi du travail (utilise F12)
  ├── F1   Animation diff live (2h) — Feedback visuel immédiat
  └── F15  send_command_input (1.5h) — Terminal interactif basique

Semaine 2 — Interaction IA ↔ Utilisateur :
  ├── F13  Outil ask_user_question (3h) — Questions structurées
  ├── F6   Questions mid-task UI (3h) — Composant React (utilise F13)
  ├── F7   Messages en queue (2h) — UX pendant travail
  └── F9   Plan validation UI (2h) — Workflow approval

Semaine 3 — Multimodal :
  ├── F2   Images pièces jointes (4h) — Upload + base64 + multimodal
  ├── F3   Entrée vocale (5h) — Micro + oscillation + transcription
  └── F8   Terminal interactif visible (3h) — Panel + interaction

Semaine 4 — Skills & Web :
  ├── F11  Système de Skills (6h) — Service + outils + skills bundled
  ├── F14  Workflows slash commands (4h) — Scanner + menu + exécution
  └── F16  search_web + read_url (5h) — Outils web
```

**Total estimé : ~46.5h de développement (~6 jours pleins)**

---

## 5. Architecture des nouveaux composants

```
src/vs/workbench/contrib/void/
├── browser/
│   ├── react/src/sidebar-tsx/
│   │   ├── ImageUpload.tsx          [F2]  — Upload + preview images
│   │   ├── VoiceInput.tsx           [F3]  — Micro + oscillation + transcription
│   │   ├── TaskProgress.tsx         [F4]  — Checklist visuelle (alimenté par F12)
│   │   ├── DiffStatsIndicator.tsx   [F1]  — Compteur +/- lignes live
│   │   └── QuestionBubble.tsx       [F13] — Question + boutons options
│   ├── skillService.ts              [F11] — Chargement/invocation des skills
│   ├── workflowService.ts           [F14] — Parsing/exécution workflows
│   ├── chatThreadService.ts         [F7,F12,F13] — Queue + todo_list + ask_user
│   ├── toolsService.ts              [F12,F13,F15] — Nouveaux outils
│   ├── editCodeService.ts           [F1]  — Event diff stats
│   ├── terminalToolService.ts       [F8,F15] — Terminal visible + sendInput
│   └── void.contribution.ts         [F11,F14] — Registration des services
├── common/
│   ├── chatThreadServiceTypes.ts    [F2,F4,F7] — Types images, tasks, queue
│   ├── skillServiceTypes.ts         [F11] — SkillDefinition, SkillMetadata
│   ├── toolsServiceTypes.ts         [F12,F13,F15,F16] — Nouveaux outils builtin
│   └── prompt/prompts.ts            [F12,F13,F15,F16] — Définitions outils
├── electron-main/
│   └── webSearchChannel.ts          [F16] — IPC pour search_web/read_url
└── .void/skills/                    [F11] — Skills utilisateur (markdown)
```

---

## 6. Dépendances et prérequis

| Feature | Dépendance | Notes |
|---|---|---|
| F2 (Images) | Modèle multimodal | Gemini, Claude, GPT-4 supportent les images |
| F3 (Voice) | `navigator.mediaDevices` | Uniquement en Electron (OK pour Void) |
| F3 (Voice) | Web Speech API ou modèle audio | Chrome/Electron embarque la Speech API |
| F5 (Drag&drop) | VS Code DnD API | Déjà disponible dans l'écosystème |
| F8 (Terminal) | `ITerminalService` de VS Code | Déjà utilisé par `terminalToolService` |

---

> **Document prêt pour validation. Aucune implémentation ne sera lancée avant ton approbation.**
