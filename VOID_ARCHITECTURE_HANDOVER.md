# Void IDE — Document de Passation Architecture

> Rédigé pour permettre à un autre LLM de reprendre les travaux d'implémentation agentique sans perte de contexte.

---

## 1. Contexte général

**Void** est un fork de **VS Code** orienté IA. Son code spécifique se trouve exclusivement dans :

```
src/vs/workbench/contrib/void/
├── browser/   # Services côté renderer (accès DOM, React, IPC vers main)
├── common/    # Services partagés browser+main (types, interfaces, logique pure)
└── (pas de main/ spécifique à void — le main process est géré par VS Code)
```

L'IDE tourne sur **Electron** : deux processus distincts.
- **Browser process** (renderer) : UI React, services DI, logique agent
- **Main process** : accès fichiers système, IPC, mises à jour

---

## 2. Système d'injection de dépendances (DI)

Void utilise le système DI de VS Code basé sur des **décorateurs TypeScript**.

### Pattern standard d'un service

```typescript
// 1. Interface dans common/
export interface IMonService {
  readonly _serviceBrand: undefined;
  onDidChangeState: Event<void>;
  state: MonState;
  doSomething(): void;
}
export const IMonService = createDecorator<IMonService>('monService');

// 2. Implémentation dans browser/
class MonService extends Disposable implements IMonService {
  readonly _serviceBrand: undefined;
  constructor(
    @IStorageService private readonly _storage: IStorageService,
  ) { super() }
}
registerSingleton(IMonService, MonService, InstantiationType.Delayed);
// NB: InstantiationType.Delayed = lazy (à la 1ère utilisation) — PAS Lazy, PAS Eager sauf besoin

// 3. Enregistrement dans void.contribution.ts
import './monService.js'
```

### Fichier d'enregistrement central
**`browser/void.contribution.ts`** — Importe tous les services pour les enregistrer dans le DI.

---

## 3. Fichiers pivots

### 3.1 Boucle agent principale
**`browser/chatThreadService.ts`** (~1941 lignes)

C'est le **cœur de l'agent**. Contient :
- `IChatThreadService` / `ChatThreadService`
- `_runLoop()` : boucle `while(shouldSendAnotherMessage)` — multi-tours
- `_runToolCall()` : exécution de chaque outil, validation, approbation, erreurs
- Gestion des checkpoints (rollback), messages UI, stream state

**Flux agent :**
```
addUserMessageAndStreamResponse()
  └── _runLoop(threadId, modelSelection, ...)
        ├── prepareLLMChatMessages()        ← convertToLLMMessageService
        ├── [Phase 4] budgetService.checkBudget()
        ├── llmMessageService.sendLLMMessage()
        │     └── onFinalMessage → toolCall ?
        │           ├── OUI → _runToolCall() → loop again
        │           └── NON → shouldSendAnotherMessage = false
        ├── [Phase 4] budgetService.recordRequest()
        └── [Phase 1] _saveThreadSummary() → memoryService.setLastConversationSummary()
```

### 3.2 Construction du prompt système
**`common/prompt/prompts.ts`** (~1100 lignes)

Fonction clé : `chat_systemMessage({ ..., memoryContext?, ... })`

**Ordre des blocs dans le prompt généré :**
1. `header` — rôle de l'agent (agent/gather/normal)
2. `userRulesBlock` — `<user_rules>` si `memoryContext.userRules` présent
3. `sysInfo` — OS, workspace folders, fichiers ouverts, terminaux
4. `persistentContextBlock` — `<persistent_context>` (KI + résumé session)
5. `webGuidelinesBlock` — `<web_application_development>` si projet web détecté
6. `toolDefinitions` — définitions XML des outils (si pas de format natif)
7. `importantDetails` — règles numérotées (planning, tools, format code, etc.)
8. `fsInfo` — arborescence fichiers `<files_overview>`

**Détection projet web :** regex sur `directoryStr` cherchant `package.json|vite.config|next.config|webpack.config|index.html`

### 3.3 Préparation des messages LLM
**`browser/convertToLLMMessageService.ts`** (~772 lignes)

- Convertit `ChatMessage[]` → format LLM (OpenAI/Anthropic/Gemini)
- Gère le trimming de contexte (window size)
- Injecte `systemMessage` + `aiInstructions`
- Appelle `chat_systemMessage()` avec le `memoryContext`
- Fusionne : `aiInstructions (settings)` + `.voidrules (workspace)` + `userRules (memoryService)`

### 3.4 Envoi LLM
**`common/sendLLMMessageService.ts`**

Abstraction sur tous les providers. Appelle `onText`, `onFinalMessage`, `onError`, `onAbort`.

### 3.5 System de prompts / outils
**`common/prompt/prompts.ts`** (même fichier)

- `builtinTools` : liste des 14 outils natifs (read_file, edit_file, run_command, etc.)
- `availableTools(chatMode, mcpTools)` : filtre selon le mode
- `systemToolsXMLPrompt()` : définitions XML pour fallback (providers sans function calling natif)

### 3.6 Exécution des outils
**`browser/toolsService.ts`**

- `validateParams[toolName]` : valide les params reçus du LLM
- `callTool[toolName]` : exécute l'outil, retourne `{ result, interruptTool? }`
- `stringOfResult[toolName]` : sérialise le résultat pour le LLM

### 3.7 Outils terminal
**`browser/terminalToolService.ts`**

- Gère les terminaux persistants
- `listPersistentTerminalIds()` → injecté dans le system prompt

### 3.8 MCP (Model Context Protocol)
**`common/mcpService.ts`**

- Communique via IPC avec le main process
- `getMCPTools()` → outils MCP disponibles
- `callMCPTool()` → exécution

---

## 4. Services Agentiques implémentés dans cette session

### 4.1 Service Mémoire (`voidMemoryService`)

| Fichier | Rôle |
|---|---|
| `common/voidMemoryServiceTypes.ts` | Types : `VoidKnowledgeItem`, `VoidMemoryState`, `VoidMemoryContext` |
| `common/voidMemoryService.ts` | Interface `IVoidMemoryService` |
| `browser/voidMemoryService.ts` | Implémentation : CRUD KI, user rules, résumés — `IStorageService` |

**Clé de stockage :** `void.memoryServiceStorage` (StorageScope.APPLICATION)

**API clé :**
```typescript
interface IVoidMemoryService {
  addKnowledgeItem(item: Omit<VoidKnowledgeItem, 'id'|'createdAt'|'updatedAt'>): void
  updateKnowledgeItem(id: string, updates: Partial<...>): void
  deleteKnowledgeItem(id: string): void
  setUserRules(rules: string): void
  setLastConversationSummary(summary: string): void
  getMemoryContext(): VoidMemoryContext  // ← injecté dans le prompt
}
```

**Où c'est connecté :**
- `convertToLLMMessageService.ts` → `memoryService.getMemoryContext()` → `chat_systemMessage(..., memoryContext)`
- `convertToLLMMessageService.ts` → `_getCombinedAIInstructions()` inclut `memoryService.getUserRules()`
- `chatThreadService.ts` → `_saveThreadSummary()` en fin de session

### 4.2 Service Budget (`voidBudgetService`)

| Fichier | Rôle |
|---|---|
| `common/voidBudgetServiceTypes.ts` | Types : `VoidBudgetState`, `BudgetCheckResult` |
| `common/voidBudgetService.ts` | Interface `IVoidBudgetService` |
| `browser/voidBudgetService.ts` | Impl. : compteurs, reset quotidien, blocklist |

**Clé de stockage :** `void.budgetServiceStorage`

**Limites configurables :**
- `maxRequestsPerDay` (0 = illimité)
- `maxTokensPerDay` (0 = illimité)
- `commandBlocklist: string[]` — sous-chaînes bloquées dans les commandes

**Où c'est connecté dans `chatThreadService.ts` :**
```typescript
// Avant sendLLMMessage :
const budgetCheck = this._budgetService.checkBudget()
if (!budgetCheck.allowed) { /* affiche message d'erreur */ break }

// Dans onFinalMessage :
this._budgetService.recordRequest(estimatedTokens)

// Dans _runToolCall (terminal) :
if (this._budgetService.isCommandBlocked(command)) { /* reject tool */ return {} }
```

### 4.3 Security Utils (`securityUtils.ts`)

Fichier **pure functions**, sans service DI.

```typescript
classifyCommand(command: string): { level: 'safe'|'moderate'|'destructive', reason: string }
isCommandSafeToAutoApprove(command: string): boolean
getCommandWarning(command: string): string | null
```

**Connecté dans `_runToolCall` :** classification + log avant exécution terminal.

---

## 5. Prompt Engineering implémenté (Phases 2 & 3)

### Phase 2 — Planification (dans `importantDetails` du prompt agent)
L'agent reçoit ces instructions en mode `agent` :
> Pour les tâches complexes : créer `implementation_plan.md` → attendre validation → exécuter en maintenant `task.md` → rédiger `walkthrough.md`

### Phase 3 — Contexte dynamique
- **User rules** : `<user_rules>` block dans le prompt si `memoryContext.userRules` non vide
- **Persistent context** : `<persistent_context>` avec résumé session + KI
- **Web guidelines** : bloc `<web_application_development>` conditionnel (si `package.json/next.config/vite.config` détecté dans `directoryStr`)

---

## 6. React / UI — Pattern d'accès aux services

Le pont entre VS Code DI et React se trouve dans :
**`browser/react/src/util/services.tsx`**

### Enregistrement (appelé une seule fois au démarrage)
```typescript
export const _registerServices = (accessor: ServicesAccessor) => {
  _registerAccessor(accessor)
  // Pour chaque service avec état réactif :
  const monService = accessor.get(IMonService)
  monState = monService.state
  monService.onDidChangeState(() => {
    monState = monService.state
    monStateListeners.forEach(l => l(monState))
  })
}
```

### Hook React (pattern à répliquer)
```typescript
// Variables module-level :
let monState: MonState
const monStateListeners = new Set<(s: MonState) => void>()

// Hook :
export const useMonState = () => {
  const [s, ss] = useState(monState)
  useEffect(() => {
    ss(monState)
    monStateListeners.add(ss)
    return () => { monStateListeners.delete(ss) }
  }, [ss])
  return s
}
```

### Accès direct à un service depuis React
```typescript
const accessor = useAccessor()
const monService = accessor.get('IMonService')
```

Pour que `accessor.get('IMonService')` fonctionne, il faut ajouter le service dans `getReactAccessor()` (ligne ~185 de `services.tsx`) :
```typescript
IVoidBudgetService: accessor.get(IVoidBudgetService),
IVoidMemoryService: accessor.get(IVoidMemoryService),
```

---

## 7. Patterns à suivre (conventions du codebase)

### Persistance
```typescript
// Lire
const raw = this._storageService.get(KEY, StorageScope.APPLICATION)
const state = raw ? JSON.parse(raw) : defaultState

// Écrire
this._storageService.store(KEY, JSON.stringify(state), StorageScope.APPLICATION, StorageTarget.USER)
```

### Emitter / Event
```typescript
private readonly _onDidChangeState = new Emitter<void>()
readonly onDidChangeState: Event<void> = this._onDidChangeState.event
// Pour déclencher : this._onDidChangeState.fire()
```

### `InstantiationType`
- `Delayed` ← À utiliser par défaut (lazy, instancié au 1er usage)
- `Eager` ← Seulement si le service doit démarrer immédiatement (rare)
- ~~`Lazy`~~ ← N'EXISTE PAS dans ce codebase

### Types ChatMessage `assistant`
```typescript
{
  role: 'assistant',
  displayContent: string,   // ← affiché à l'utilisateur
  reasoning: string,        // ← raisonnement step-by-step (peut être '')
  anthropicReasoning: AnthropicReasoning[] | null,
}
// NB: PAS de fullText / fullReasoning dans le type persisté
```

---

## 8. Tâches restantes (Phase 5)

### 5.1 Exposer les services dans React (`services.tsx`)
**Fichier :** `browser/react/src/util/services.tsx`

Ajouter dans `getReactAccessor()` (~ligne 185) :
```typescript
import { IVoidBudgetService } from '../../../../common/voidBudgetService.js'
import { IVoidMemoryService } from '../../../../common/voidMemoryService.js'

// Dans getReactAccessor :
IVoidBudgetService: accessor.get(IVoidBudgetService),
IVoidMemoryService: accessor.get(IVoidMemoryService),
```

Ajouter dans `_registerServices()` :
```typescript
let budgetState: VoidBudgetState
const budgetStateListeners = new Set<(s: VoidBudgetState) => void>()

const budgetService = accessor.get(IVoidBudgetService)
budgetState = budgetService.state
disposables.push(budgetService.onDidChangeState(() => {
  budgetState = budgetService.state
  budgetStateListeners.forEach(l => l(budgetState))
}))
```

Hook à créer :
```typescript
export const useBudgetState = () => { /* même pattern que useSettingsState */ }
export const useMemoryState = () => { /* idem */ }
```

### 5.2 Composant BudgetStatusBar
**Dossier :** `browser/react/src/sidebar-tsx/`

Afficher dans la sidebar :
- Requêtes aujourd'hui / max (ou "∞" si 0)
- Tokens estimés / max
- Optionnel : progression visuelle (barre)

### 5.3 Fallback provider automatique
**Fichier :** `browser/chatThreadService.ts`, dans le callback `onError` de `sendLLMMessage` (~ligne 840)

Logique :
```typescript
onError: async (error) => {
  if (isQuotaError(error) && fallbackProviders.length > 0) {
    // retry avec prochain provider
  }
}
```

Ajouter `fallbackProviders: ModelSelection[]` dans `GlobalSettings` (`common/voidSettingsTypes.ts`)

### 5.4 Export logs structurés
Nouveau service : `browser/voidLogExportService.ts`
- Écouter les events de `chatThreadService` et `voidBudgetService`
- Exposer `exportLogs(): string` (JSON)
- Bouton dans `browser/react/src/void-settings-tsx/`

---

## 9. Commandes de build

```bash
# Tous lancés dans e:\dev\void\
npm run watch-client    # compile le code VS Code principal
npm run watchreact      # compile le React de la sidebar
npm run watch-extensions # compile les extensions
```

Les 3 doivent tourner simultanément en développement.

---

## 10. Fichiers modifiés dans cette session (diff minimal)

| Fichier | Modifications |
|---|---|
| `browser/void.contribution.ts` | +import voidMemoryService, +import voidBudgetService |
| `browser/convertToLLMMessageService.ts` | +IVoidMemoryService, +getMemoryContext(), +getUserRules() |
| `browser/chatThreadService.ts` | +IVoidMemoryService, +IVoidBudgetService, +budget check, +_saveThreadSummary, +security check |
| `common/prompt/prompts.ts` | +memoryContext param, +user_rules block, +persistent_context block, +planning instructions, +web guidelines |
