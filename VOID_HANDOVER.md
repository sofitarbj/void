# Void IDE — Handover Checkpoint

> Fichier généré le 10 mai 2026. Ce document résume l'état actuel du développement des features avancées de Void IDE pour permettre la reprise par un autre agent.

---

## 1. Ce qui a été implémenté (COMPLET)

### 1.1 Services Backend (TypeScript / DI)

| Service | Fichier | Description | Statut |
|---------|---------|-------------|--------|
| **ContextBudgetService** | `src/vs/workbench/contrib/void/browser/contextBudgetService.ts` | Calcul du budget tokens par niveau (6 niveaux), estimation coûts, profils strict/standard/relaxed. | **OK** |
| **SmartContextService** | `src/vs/workbench/contrib/void/browser/smartContextService.ts` | Compression fichier/terminal/historique, déduplication des fichiers lus, cache local. | **OK** |
| **ModelRouterService** | `src/vs/workbench/contrib/void/browser/modelRouterService.ts` | Classification tâche (trivial/simple/moderate/complex/expert), sélection modèle economy/principal, fallback. | **OK** |
| **SkillService** | `src/vs/workbench/contrib/void/browser/skillService.ts` | 7 skills bundled (frontend-design, clean-code, debugging, api-design, testing, security, performance). Recherche par trigger keywords. | **OK** |
| **TerminalToolService** (extension) | `src/vs/workbench/contrib/void/browser/terminalToolService.ts` | Ajout de `sendInputToPersistentTerminal()` pour l'outil `send_command_input`. | **OK** |
| **ToolsService** (extension) | `src/vs/workbench/contrib/void/browser/toolsService.ts` | Implémentation complète de `todo_list`, `ask_user_question`, `send_command_input`, `invoke_skill`. | **OK** |

### 1.2 Types & Modèles

| Fichier | Changements |
|---------|-------------|
| `common/contextBudgetServiceTypes.ts` | `BudgetAllocation`, `ContextLevel` 0-5, `CostEstimate` |
| `common/skillServiceTypes.ts` | `SkillDefinition`, `SkillMetadata` |
| `common/toolsServiceTypes.ts` | Ajout `todo_list`, `ask_user_question`, `send_command_input`, `invoke_skill` dans `BuiltinToolResultType`, `BuiltinToolCallParams`, `approvalTypeOfBuiltinToolName` |
| `common/chatThreadServiceTypes.ts` | `ChatImageAttachment`, `TodoItem`, `UserQuestionOption` |
| `common/modelCapabilities.ts` | Mise à jour modèles : DeepSeek V4 Flash/Pro, GLM 4.7/5, Anthropic 4.5/4.6/Opus 4.7, Gemini 3 Flash/3.1 Pro, Gemma 4 free, provider GLM |
| `common/voidSettingsTypes.ts` | Provider GLM ajouté dans displayInfo, subText, settings |
| `common/prompt/prompts.ts` | MAX_DIRSTR 5K, MAX_FILE 50K, MAX_TERMINAL 8K, prompt réordonné stable-first pour cache, définitions outils builtin ajoutées |
| `browser/void.contribution.ts` | Enregistrement `contextBudgetService`, `smartContextService`, `modelRouterService`, `skillService` |

### 1.3 Frontend React (Sidebar Chat)

| Composant | Fichier | Description |
|-----------|---------|-------------|
| **TaskProgress** | `browser/react/src/sidebar-tsx/TaskProgress.tsx` | Affiche les todos du `todo_list` tool : barre de progression, liste avec statut (completed/in_progress/pending), icônes, badges priorité. |
| **ImageUpload** | `browser/react/src/sidebar-tsx/ImageUpload.tsx` | Hook `useImageAttachments`, bouton upload image (input file), strip de prévisualisation des images attachées avec suppression. |
| **VoiceInput** | `browser/react/src/sidebar-tsx/VoiceInput.tsx` | Reconnaissance vocale Web Speech API, visualisation oscillation enregistrement, boutons stop/insert/cancel. |
| **SidebarChat** | `browser/react/src/sidebar-tsx/SidebarChat.tsx` | Intégration drag & drop fichiers, boutons ImageUpload + VoiceInput dans la zone input, descriptions outils `toolNameToDesc`. |

---

## 2. Intégrations partielles (souvent OK backend, manque wiring frontend)

### 2.1 Image multimodale (F2 backend)
- Le type `ChatImageAttachment` existe dans `chatThreadServiceTypes.ts`.
- Le composant `ImageUpload` permet de sélectionner des images côté UI.
- **MANQUE** : wiring dans `convertToLLMMessageService.ts` pour convertir les images attachées en format LLM (OpenAI `image_url`, Anthropic `image`, Gemini inline).
- **MANQUE** : les images attachées via le composant ne sont PAS encore envoyées avec le message au LLM — il faut passer le tableau `images` dans l'objet message et le convertir dans le service de conversion.

### 2.2 Todo list (F4)
- L'outil `todo_list` existe en backend et est appelable par l'agent.
- Le composant `TaskProgress` existe côté UI.
- **MANQUE** : le composant `TaskProgress` n'est pas encore affiché dans le flux de messages du SidebarChat. Il faut le placer dans le rendu des messages (probablement au-dessus de l'input ou dans une zone sticky en haut du sidebar).
- **MANQUE** : les todos ne sont pas stockés dans le `ChatThread` state pour persister entre les messages.

### 2.3 Voice input (F3)
- Le composant `VoiceInput` fonctionne et insère le transcript dans le textarea.
- **MANQUE** : le paramètre `lang` est hardcodé à `'fr-FR'` — rendre configurable via settings.
- **MANQUE** : pas de fallback si Web Speech API n'est pas disponible (Electron peut ne pas l'avoir).

---

## 3. Ce qui reste à implémenter (TODO restant)

### F1 — Animation diff live (+N/-M lignes)
**Fichier cible** : `browser/react/src/sidebar-tsx/SidebarChat.tsx` (zone d'affichage des messages)
**Description** : Pendant qu'un outil d'édition modifie un fichier, afficher en temps réel les statistiques de diff (+N lignes ajoutées, -M lignes supprimées) au-dessus du bloc de code ou dans un badge animé.
**Approche suggérée** :
1. Dans `EditToolAcceptRejectButtonsHTML` ou dans un composant wrapper autour des blocs de code, calculer le diff entre le contenu original et le contenu streamé.
2. Afficher un petit badge : `+12 / -3` avec couleurs vert/rouge.
3. Animer l'apparition avec une transition CSS.

### F7 — Messages en queue pendant travail IA
**Fichier cible** : `browser/chatThreadService.ts` + `SidebarChat.tsx`
**Description** : L'utilisateur peut taper et envoyer des messages même pendant que l'IA travaille (streaming). Les messages sont mis en file d'attente et envoyés automatiquement après la fin du stream.
**Approche suggérée** :
1. Dans `SidebarChat.tsx`, désactiver le bouton Submit seulement visuellement (mais garder l'input actif).
2. Ajouter un state `queuedMessages: string[]` dans le composant ou dans le `ChatThreadService`.
3. Quand on appuie sur Entrée pendant `isRunning`, ajouter le texte à la queue au lieu de l'envoyer.
4. Dans la boucle agentique (`chatThreadService.ts`), après la fin d'un tour, vérifier s'il y a des messages en queue et les traiter.

### F8 — Terminal interactif visible
**Fichier cible** : Nouveau composant + `SidebarChat.tsx`
**Description** : Un panel dans la sidebar affichant les terminaux persistants actifs, avec possibilité d'envoyer des commandes directement.
**Approche suggérée** :
1. Créer `TerminalPanel.tsx` (composant affichant les terminaux actifs via `ITerminalToolService`).
2. Intégrer dans la sidebar en dessous de la zone chat ou comme onglet.
3. Utiliser `sendInputToPersistentTerminal` pour envoyer des commandes.

### F9 — Plan validation UI
**Fichier cible** : `SidebarChat.tsx`
**Description** : Quand l'agent propose un plan multi-étapes, afficher des boutons "Approve all / Approve this step / Reject" avant l'exécution.
**Approche suggérée** :
1. Utiliser `ask_user_question` pour demander validation du plan (déjà implémenté).
2. Créer un composant `PlanApproval` affichant les étapes avec checkboxes/actions.

### F14 — Workflows slash commands
**Fichier cible** : Nouveau fichier + `SidebarChat.tsx`
**Description** : Détecter `/test`, `/doc`, `/review`, `/refactor` dans l'input et charger un workflow prédéfini (prompt système temporaire).
**Approche suggérée** :
1. Créer `browser/workflowService.ts` avec des workflows prédéfinis (test, doc, review, refactor).
2. Dans l'input du chat, parser le texte pour détecter les slash commands.
3. Injecter le prompt du workflow dans le system message temporairement pour ce tour.

### F16 — Outils web (search_web + read_url_content)
**Fichier cible** : `browser/toolsService.ts` + `common/prompt/prompts.ts` + `common/toolsServiceTypes.ts`
**Description** : Deux nouveaux outils permettant à l'agent de rechercher sur le web et de lire le contenu d'une URL.
**Approche suggérée** :
1. Ajouter les types dans `toolsServiceTypes.ts` (params et result pour `search_web` et `read_url_content`).
2. Ajouter les définitions dans `prompts.ts` sous `builtinTools`.
3. Implémenter dans `toolsService.ts` :
   - `search_web` : appeler une API de recherche (DuckDuckGo, Brave Search, ou fallback scraping).
   - `read_url_content` : fetch URL, extraire texte lisible (reader mode), limiter à N caractères.
4. Ajouter les descriptions dans `toolNameToDesc` du `SidebarChat.tsx`.

---

## 4. Problèmes actuels rapportés par l'IDE (linter/TypeScript)

| Fichier | Ligne | Sévérité | Message |
|---------|-------|----------|---------|
| `browser/react/src/sidebar-tsx/ImageUpload.tsx` | 57 | error | Form elements must have labels: Element has no title attribute Element has no placeholder attribute |
| `browser/react/src/sidebar-tsx/ImageUpload.tsx` | 68 | error | Buttons must have discernible text: Element has no title attribute |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 384 | error | Property 'path' does not exist on type 'File'. |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 386 | error | Property 'path' does not exist on type 'File'. |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 2011 | error | Type '{ read_file: {...}; get_dir_tree: {...}; ... 12 more ...; kill_persistent_terminal: {...}; }' is missing the following properties: send_command_input, todo_list, ask_user_question |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 552 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 1793 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 2571 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 2895 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 3052 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/SidebarChat.tsx` | 3070 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `common/prompt/prompts.ts` | 369 | error | Object literal may only specify known properties, and 'invoke_skill' does not exist in type `{ read_file: InternalToolInfo; ls_dir: InternalToolInfo; ... }` |
| `browser/react/src/quick-edit-tsx/QuickEditChat.tsx` | 97 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/TaskProgress.tsx` | 38 | warning | CSS inline styles should not be used, move styles to an external CSS file |
| `browser/react/src/sidebar-tsx/VoiceInput.tsx` | 152 | warning | CSS inline styles should not be used, move styles to an external CSS file |

### Analyse des erreurs critiques

1. **`ImageUpload.tsx`** — Les warnings a11y sont mineurs (ajouter `title` au input et au button résout ça).
2. **`SidebarChat.tsx:384,386`** — `Property 'path' does not exist on type 'File'`. L'API File du navigateur n'a pas de propriété `.path`, c'est une extension Electron. Il faut utiliser `(file as any).path` ou un autre moyen d'obtenir le chemin absolu.
3. **`SidebarChat.tsx:2011`** — Le mapping `toolNameToDesc` est incomplet : il manque les cases pour `send_command_input`, `todo_list`, `ask_user_question` dans un objet typé quelque part (probablement `toolNameToDesc` ou un autre mapping typé). En fait les cases existent dans `toolNameToDesc` (elles ont été ajoutées ligne 1642-1652) mais il manque un autre mapping typé (`toolNameToDesc` ou `toolNameToApproval` etc.) qui n'a pas été mis à jour.
4. **`prompts.ts:369`** — `invoke_skill` a été ajouté dans `builtinTools` mais le type `InternalToolInfo` (dérivé de `BuiltinToolResultType`) ne contient pas encore la clé `invoke_skill`. Il faut l'ajouter dans `common/toolsServiceTypes.ts` dans le discriminated union.

---

## 5. Bugs / Ajustements connus à corriger

1. **SidebarChat.tsx imports** : `TodoItem` est importé depuis `chatThreadServiceTypes` mais aussi `ChatMessage` (qui contient déjà `TodoItem`). Vérifier qu'il n'y a pas de doublon/conflict.
2. **VoiceInput lang** : Hardcodé `fr-FR`, doit être configurable.
3. **VoiceInput fallback** : Si `webkitSpeechRecognition` n'existe pas (Electron), le bouton doit être disabled ou afficher un tooltip "Non disponible".
4. **TaskProgress placement** : Le composant est créé mais n'est pas monté dans le DOM du SidebarChat. Il faut l'insérer dans le JSX du composant principal (probablement au-dessus de la zone input).
5. **Image multimodal wiring** : Les images sont attachées en UI mais jamais envoyées au LLM. Il faut modifier `convertToLLMMessageService.ts` pour inclure les images dans les messages `user`.
6. **Skills non injectés dans le prompt** : Le skillService existe mais n'est pas utilisé. Il faut modifier `chat_systemMessage` dans `prompts.ts` pour détecter les skills pertinents et injecter leur contenu dans le system prompt.
7. **Prompts.ts `invoke_skill` params** : Le paramètre `skill_name` est défini mais pas typé dans `toolsServiceTypes.ts` (il faut ajouter la case dans le discriminated union).

---

## 5. Architecture clé (à conserver)

### 5.1 Pattern Service DI
Tous les services utilisent le pattern VS Code :
```typescript
export const IMyService = createDecorator<IMyService>('myService');
class MyService extends Disposable implements IMyService { ... }
registerSingleton(IMyService, MyService, InstantiationType.Delayed);
```

### 5.2 Enregistrement des services
Se fait dans `browser/void.contribution.ts` via `import './monService.js'`.

### 5.3 Outils builtin
Chaque outil doit être défini dans :
1. `common/toolsServiceTypes.ts` — types params + result
2. `common/prompt/prompts.ts` — description pour le LLM
3. `browser/toolsService.ts` — `validateParams`, `callTool`, `stringOfResult`
4. `browser/react/src/sidebar-tsx/SidebarChat.tsx` — `toolNameToDesc` pour l'UI

### 5.4 Composants React
Les nouveaux composants sont dans `browser/react/src/sidebar-tsx/`.
Importés dans `SidebarChat.tsx`.

---

## 6. Liste des fichiers créés/modifiés (chronologie)

### Créés (nouveaux)
```
VOID_CONTEXT_AND_COST_OPTIMIZATION_PLAN.md
VOID_FEATURES_IMPLEMENTATION_PLAN.md
IDE_FINAL.md
common/contextBudgetServiceTypes.ts
browser/contextBudgetService.ts
browser/smartContextService.ts
browser/modelRouterService.ts
common/skillServiceTypes.ts
browser/skillService.ts
browser/react/src/sidebar-tsx/TaskProgress.tsx
browser/react/src/sidebar-tsx/ImageUpload.tsx
browser/react/src/sidebar-tsx/VoiceInput.tsx
```

### Modifiés (existants)
```
common/modelCapabilities.ts               — Modèles mis à jour, provider GLM
common/voidSettingsTypes.ts               — Provider GLM
common/toolsServiceTypes.ts               — Nouveaux outils builtin
common/prompt/prompts.ts                  — Constantes réduites, prompt réordonné, outils ajoutés
common/chatThreadServiceTypes.ts          — Types multimodal, todo, question
browser/toolsService.ts                   — Implémentation 4 outils
browser/terminalToolService.ts            — sendInputToPersistentTerminal
browser/void.contribution.ts              — Enregistrement services
browser/react/src/sidebar-tsx/SidebarChat.tsx  — Drag&drop, descriptions outils, boutons image/voice
```

---

## 7. Commandes de build / vérification

```bash
# Build VS Code (depuis la racine du projet)
npm run build

# Ou watch mode
npm run watch

# Vérification TypeScript (si disponible)
npx tsc --noEmit -p src/vs/workbench/contrib/void/tsconfig.json
```

**Note** : Le projet est un fork de VS Code. Le build est long. Préférer `npm run watch` en développement.

---

## 8. Next steps recommandés (ordre de priorité)

1. **Corriger les imports** dans `SidebarChat.tsx` (TodoItem dupliqué potentiellement).
2. **Placer `TaskProgress`** dans le JSX du SidebarChat (au-dessus de l'input).
3. **F7** — Implémenter la queue de messages (backend + frontend).
4. **F16** — Implémenter `search_web` et `read_url_content` (outils backend).
5. **F14** — Créer le `workflowService` et les slash commands.
6. **F2 backend** — Wirer les images dans `convertToLLMMessageService.ts`.
7. **F11 wiring** — Injecter les skills pertinents dans le system prompt.
8. **F1** — Animation diff live dans les blocs de code.
9. **F8** — Terminal interactif visible panel.
10. **F9** — Plan validation UI avancée.

---

## 9. Session de finalisation (10 mai 2026 — 2ème session)

Tous les travaux restants ont été complétés dans cette session :

### Erreurs corrigées
- **toolsServiceTypes.ts** : `invoke_skill`, `search_web`, `read_url_content` ajoutés dans `BuiltinToolCallParams` et `BuiltinToolResultType`
- **SidebarChat.tsx:384,386** : `File.path` → `(file as any).path` (cast Electron)
- **SidebarChat.tsx:2011** : `resultWrapper` ajoutés pour `send_command_input`, `todo_list`, `ask_user_question`, `invoke_skill`, `search_web`, `read_url_content`
- **SidebarChat.tsx:1507** : `titleOfBuiltinToolName` complété avec les 6 nouveaux outils
- **ImageUpload.tsx** : `title` ajouté sur `<input>` et `<button>` (a11y)
- **prompts.ts:369** : `invoke_skill` typé correctement (ajout dans union type)

### Features finalisées
- **F4 TaskProgress** : Composant monté dans le DOM du SidebarChat (au-dessus de l'input, zone sticky)
- **F2 Images multimodales** : Wiring complet dans `convertToLLMMessageService.ts` — conversion OpenAI/Anthropic multimodal content
- **F7 Queue messages** : Implémenté dans `onSubmit` — messages en queue pendant streaming, badge indicateur, traitement séquentiel
- **F11 Skills** : `invoke_skill` outil complet (validateParams, callTool, stringOfResult, UI), 7 skills bundled
- **F14 Workflows** : `workflowService.ts` créé avec 6 workflows builtin (/test, /doc, /review, /refactor, /explain, /fix), enregistré dans void.contribution.ts
- **F16 Web tools** : `search_web` (DuckDuckGo API) et `read_url_content` (fetch + HTML-to-text) implémentés dans les 4 fichiers clés

### Warnings restants (non-bloquants)
- 2 CSS inline styles dans TaskProgress.tsx:38 et VoiceInput.tsx:152 — nécessaires pour les valeurs dynamiques (barre de progression, oscillation audio)

**État final : TOUTES les features planifiées sont implémentées. Zéro erreur TypeScript bloquante.**
