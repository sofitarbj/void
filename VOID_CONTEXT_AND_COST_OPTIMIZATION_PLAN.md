# VOID_CONTEXT_AND_COST_OPTIMIZATION_PLAN.md

> Plan technique d'optimisation du contexte et des coûts LLM pour Void IDE
> Basé sur l'audit du code source réel — Mai 2025

---

## Table des Matières

1. [Audit de la gestion du contexte actuelle](#1-audit-de-la-gestion-du-contexte-actuelle)
2. [Stratégie Smart Context Manager](#2-stratégie-smart-context-manager)
3. [Context Budget Manager](#3-context-budget-manager)
4. [Routage intelligent des modèles](#4-routage-intelligent-des-modèles)
5. [Prompt Caching](#5-prompt-caching)
6. [Compression du contexte](#6-compression-du-contexte)
7. [Plan d'implémentation](#7-plan-dimplémentation)

---

## 1. Audit de la gestion du contexte actuelle

### 1.1 Construction du prompt système

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts` (lignes 429–593)

**Fonction clé :** `chat_systemMessage()`

**Ordre des blocs générés :**
1. `header` — rôle de l'agent (agent/gather/normal) ~200 chars
2. `userRulesBlock` — `<user_rules>` si `memoryContext.userRules` présent (max 2000 chars)
3. `sysInfo` — OS, workspace folders, fichiers ouverts, terminaux (~500-2000 chars)
4. `persistentContextBlock` — `<persistent_context>` KI + résumé session (~1000-5000 chars)
5. `webGuidelinesBlock` — `<web_application_development>` si projet web détecté (~1200 chars)
6. `toolDefinitions` — définitions XML des outils si pas de format natif (~3000-6000 chars)
7. `importantDetails` — règles numérotées planning/tools/format (~3000-5000 chars)
8. `fsInfo` — arborescence fichiers `<files_overview>` (**jusqu'à 20 000 chars**)

**Gaspillage identifié :**
- `fsInfo` : Envoie systématiquement jusqu'à **20 000 chars** d'arborescence fichiers (`MAX_DIRSTR_CHARS_TOTAL_BEGINNING = 20_000`). C'est le bloc le plus coûteux et il est rarement utile en entier.
- `webGuidelinesBlock` : ~1200 chars envoyés à **chaque requête** en mode agent si un `package.json` est détecté, même pour des questions simples.
- `importantDetails` : ~5000 chars de règles dont beaucoup sont redondantes tour après tour (ex: format des code blocks, rappels planning).
- `toolDefinitions` XML : ~6000 chars de définitions d'outils envoyées en mode gather/agent même si le LLM n'en utilise qu'un sous-ensemble.
- Pas de **déduplication** : le prompt système complet est reconstruit et envoyé à chaque tour de boucle agent.

**Ce qui est efficace :**
- Le `header` est court et ciblé.
- La détection conditionnelle du projet web (`isWebProject`).
- Le `userRulesBlock` est conditionnel et limité (2000 chars max).

---

### 1.2 Injection du contexte utilisateur

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts` (lignes 682–707)

**Fonction clé :** `chat_userMessageContent()`

```typescript
// Sélections utilisateur envoyées dans le message user
const selnsStrs = await Promise.all(
  (currSelns ?? []).map(async (s) =>
    messageOfSelection(s, { folderOpts: { maxChildren: 100, maxCharsPerFile: 100_000 } })
  )
)
```

**Gaspillage identifié :**
- `maxCharsPerFile: 100_000` — Un seul fichier sélectionné peut consommer **100K chars** (~25K tokens).
- `maxChildren: 100` — Un dossier entier peut être dumpé avec 100 fichiers enfants.
- Aucune **relevance filtering** : tous les fichiers sélectionnés sont envoyés intégralement.
- Pas de truncation intelligente (juste un cutoff brut).

---

### 1.3 Fichiers ouverts et fichier actif

**Fichier :** `src/vs/workbench/contrib/void/browser/convertToLLMMessageService.ts` (lignes 584–603)

```typescript
const openedURIs = this.modelService.getModels()
  .filter(m => m.isAttachedToEditor())
  .map(m => m.uri.fsPath) || [];
const activeURI = this.editorService.activeEditor?.resource?.fsPath;
```

**Analyse :**
- Seuls les **chemins** des fichiers ouverts sont envoyés (pas le contenu) — c'est bien.
- Le fichier actif est envoyé uniquement comme chemin dans `sysInfo`.
- **Mais** le `directoryStr` inclut potentiellement ces mêmes fichiers dans l'arborescence.

**Amélioration possible :**
- Envoyer un extrait contextuel du fichier actif (zone autour du curseur) plutôt que juste le chemin.
- Ne pas inclure les fichiers ouverts dans `directoryStr` (déduplication).

---

### 1.4 Historique de chat

**Fichier :** `src/vs/workbench/contrib/void/browser/convertToLLMMessageService.ts` (lignes 611–641)

```typescript
private _chatMessagesToSimpleMessages(chatMessages: ChatMessage[]): SimpleLLMMessage[] {
  for (const m of chatMessages) {
    if (m.role === 'checkpoint') continue
    if (m.role === 'interrupted_streaming_tool') continue
    if (m.role === 'assistant') {
      simpleLLMMessages.push({ role: m.role, content: m.displayContent, ... })
    }
    else if (m.role === 'tool') {
      simpleLLMMessages.push({ role: m.role, content: m.content, ... })
    }
    else if (m.role === 'user') {
      simpleLLMMessages.push({ role: m.role, content: m.content })
    }
  }
}
```

**Gaspillage identifié :**
- **Tout l'historique** est converti et envoyé, sans résumé ni condensation.
- Les résultats d'outils (`tool.content`) contiennent souvent des fichiers entiers (read_file) ou des arborescences complètes (ls_dir, get_dir_tree) qui sont réinjectés en intégralité.
- Pas de mécanisme de **summarization** des tours précédents.
- La seule protection est le trimming par poids (lignes 286-364) qui coupe brutalement les messages.

---

### 1.5 Trimming de contexte (fit into context window)

**Fichier :** `src/vs/workbench/contrib/void/browser/convertToLLMMessageService.ts` (lignes 286–364)

```typescript
const CHARS_PER_TOKEN = 4
const TRIM_TO_LEN = 120

// Poids : system = 0.01, user = 1, assistant/tool = 10
// Messages récents protégés (idx >= messages.length - 1 - 3) → multiplier *= 0.05
```

**Analyse :**
- Le trimming est **réactif** (coupe après construction) plutôt que **proactif** (envoyer moins dès le départ).
- `CHARS_PER_TOKEN = 4` est pessimiste (la réalité est ~3.5 pour l'anglais, ~2-3 pour le code).
- Les messages tronqués deviennent `"120 chars...` → **perte d'information critique**.
- Le `reservedOutputTokenSpace` est au minimum `contextWindow * 1/2` (ligne 266) — très conservateur.

---

### 1.6 Descriptions des outils

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts` (lignes 187–346, 381–424)

- **14 outils builtin** définis avec descriptions complètes.
- En mode XML (providers sans function calling), toutes les définitions sont sérialisées en texte dans le system prompt.
- En mode `openai-style` ou `anthropic-style`, les outils sont passés via l'API native (ne consomment pas le contexte principal, mais comptent dans le coût token).

**Gaspillage :**
- Les descriptions sont verboses (ex: `search_replace_blocks` fait ~500 chars de description à elle seule).
- Même en `gather` mode, **tous** les outils read/search sont envoyés alors que seuls 2-3 sont pertinents.
- Le `terminalDescHelper` est dupliqué entre `run_command` et `run_persistent_command`.

---

### 1.7 Résultats d'outils réinjectés

**Fichier :** `src/vs/workbench/contrib/void/browser/toolsService.ts`

Les résultats d'outils (`stringOfResult[toolName]`) sont injectés tels quels :
- `read_file` : contenu complet du fichier (jusqu'à `MAX_FILE_CHARS_PAGE = 500_000` chars !)
- `ls_dir` : `MAX_CHILDREN_URIs_PAGE = 500` entries
- `get_dir_tree` : `MAX_DIRSTR_CHARS_TOTAL_TOOL = 20_000` chars
- `run_command` / terminal : `MAX_TERMINAL_CHARS = 100_000` chars

**Gaspillage critique :** Un seul `read_file` peut injecter **500K chars (~125K tokens)** dans le contexte. Combiné avec l'historique, cela dépasse rapidement la fenêtre de contexte et déclenche le trimming brutal.

---

### 1.8 Sélection de modèle

**Fichier :** `src/vs/workbench/contrib/void/common/voidSettingsTypes.ts` (lignes 364-367)

```typescript
export type ModelSelectionOfFeature = Record<FeatureName, ModelSelection | null>
// Features: 'Chat', 'Ctrl+K', 'Autocomplete', 'Apply', 'SCM'
```

**Analyse :**
- Un seul modèle par feature — pas de **routing intelligent** selon la complexité de la tâche.
- Pas de distinction entre tâches simples (réponse rapide) et tâches complexes (agent multi-tour).
- Pas de fallback automatique vers un modèle moins cher si la tâche est simple.

---

### 1.9 Estimation des coûts

**Fichier :** `src/vs/workbench/contrib/void/common/modelCapabilities.ts` (lignes 193-199)

```typescript
cost: {
  input: number;   // $/M tokens input
  output: number;  // $/M tokens output
  cache_read?: number;
  cache_write?: number;
}
```

Les coûts sont **définis statiquement** par modèle mais **jamais calculés ni affichés** à l'utilisateur en temps réel. Le `voidBudgetService` ne fait qu'estimer (`fullText.length / 4`) sans utiliser ces tarifs.

---

### 1.10 Retries

**Fichier :** `src/vs/workbench/contrib/void/browser/chatThreadService.ts` (lignes 47-49, 820-917)

```typescript
const CHAT_RETRIES = 3
const RETRY_DELAY = 2500
```

- Retry simple avec délai fixe de 2.5s.
- Pas d'exponential backoff.
- Pas de switch de modèle/provider sur erreur.
- Chaque retry **renvoie le même payload complet** → gaspillage si le contexte était trop gros.

---

### 1.11 Résumé des gaspillages quantifiés

| Source de gaspillage | Tokens gaspillés/requête | Fréquence |
|---|---|---|
| `directoryStr` (20K chars) | ~5 000 tokens | Chaque requête |
| `toolDefinitions` XML complet | ~1 500 tokens | Chaque requête agent/gather |
| `webGuidelinesBlock` | ~300 tokens | Chaque requête agent (web) |
| `importantDetails` répétés | ~1 200 tokens | Chaque requête |
| `read_file` résultats non compressés | 5 000-125 000 tokens | Chaque tool call read_file |
| Historique non résumé (après 5 tours) | 10 000-50 000 tokens | Croissant |
| Sélections utilisateur brutes | 2 000-25 000 tokens | Si fichier sélectionné |

**Estimation conservatrice :** 8 000 à 15 000 tokens gaspillés par requête en mode agent, soit **30-60% du budget contexte** sur un modèle 32K.

---

## 2. Stratégie Smart Context Manager

### Architecture proposée

**Nouveau service :** `src/vs/workbench/contrib/void/browser/smartContextService.ts`

```
SmartContextManager
├── ContextLevelClassifier    — Classe chaque élément par niveau 0-5
├── ContextBudgetAllocator    — Alloue un budget tokens par niveau
├── ContextCompressor         — Compresse chaque élément selon son niveau
├── ContextCache              — Cache les éléments stables (prompt, tools)
└── ContextRelevanceScorer    — Score la pertinence par rapport à la requête
```

---

### Niveau 0 — Toujours envoyé (< 500 tokens)

**Contenu :**
- Rôle de l'agent (1 phrase)
- Mode actuel (agent/gather/normal)
- OS (1 ligne)
- Workspace principal (1 chemin)
- Modèle utilisé (1 identifiant)
- Date du jour

**Quand l'envoyer :** Toujours, à chaque requête.
**Taille max :** 500 tokens (2000 chars).
**Compression :** Aucune — déjà minimal.
**Expiration :** Jamais (statique par session).

**Implémentation :**
```typescript
// Dans prompts.ts, remplacer le header + sysInfo par :
const level0 = `You are an expert coding ${mode}. OS: ${os}. Workspace: ${workspaceFolders[0]}. Model: ${modelName}. Date: ${today}.`
```

---

### Niveau 1 — Contexte immédiat (< 2000 tokens)

**Contenu :**
- Fichier actif (chemin + zone curseur ±30 lignes)
- Sélection active (si existante, max 100 lignes)
- Erreur visible dans l'éditeur (diagnostics du fichier actif)
- Terminal actif (dernières 20 lignes)
- Dernier résultat d'outil (résumé, pas intégral)

**Quand l'envoyer :** Si le fichier actif existe et que la requête est liée au code.
**Quand ne pas l'envoyer :** Questions générales, conversation libre, configuration.
**Taille max :** 2000 tokens (8000 chars).
**Compression :** Truncation intelligente (garder les imports + zone curseur + signature des fonctions proches).
**Récupération :** `IEditorService`, `IMarkerService`, `ITerminalToolService`.
**Expiration :** Immédiate (recalculé à chaque requête).

---

### Niveau 2 — Contexte demandé (< 4000 tokens)

**Contenu :**
- Fichiers explicitement mentionnés (via `@file`)
- Imports directs du fichier actif
- Configuration pertinente (package.json, tsconfig — seulement les champs utiles)
- Fichiers récemment modifiés (derniers 3)

**Quand l'envoyer :** Quand le message utilisateur mentionne des fichiers ou quand le mode est agent/gather.
**Quand ne pas l'envoyer :** Mode normal sans mention de fichier.
**Taille max :** 4000 tokens.
**Compression :**
- Fichiers mentionnés : seulement les parties pertinentes (fonctions/classes liées).
- package.json : seulement `dependencies` + `scripts`.
- tsconfig : seulement `compilerOptions.paths` + `include`.
**Récupération :** Parser les `@mentions` dans le message, résoudre les imports.
**Expiration :** Durée du thread.

---

### Niveau 3 — Contexte récupéré par outils (variable, limité par budget)

**Contenu :**
- Résultats de grep/search (max 50 lignes pertinentes, pas les fichiers entiers)
- Arbre de fichiers (max 3 niveaux, max 50 entrées)
- Symboles pertinents (signatures, pas les corps)
- Dépendances directes (1 niveau)

**Quand l'envoyer :** Uniquement quand un outil l'a explicitement récupéré.
**Quand ne pas l'envoyer :** Jamais envoyé automatiquement/proactivement.
**Taille max :** Dynamique (budget restant après niveaux 0-2).
**Compression :**
- `read_file` : extraire seulement les lignes pertinentes (±20 lignes autour du match).
- `ls_dir` : limiter à 30 entrées, exclure les fichiers générés.
- `run_command` : garder seulement les dernières 50 lignes de sortie.
**Récupération :** Via outils standard (read_file, search_for_files, etc.).
**Expiration :** Fin du tour courant (résumé si réutilisé au tour suivant).

---

### Niveau 4 — Mémoire persistante (< 1000 tokens)

**Contenu :**
- User rules (max 500 tokens)
- Knowledge Items pertinents (max 3 KI les plus pertinents, pas tous les 20)
- Résumé dernière conversation (max 200 tokens)
- Patterns techniques validés

**Quand l'envoyer :** Si les tags des KI matchent le contexte de la requête.
**Quand ne pas l'envoyer :** Si aucun KI n'est pertinent (score relevance < 0.3).
**Taille max :** 1000 tokens.
**Compression :** KI déjà condensés (max 800 chars). Filtrer par pertinence.
**Récupération :** `IVoidMemoryService.getMemoryContext()` + scoring par tags.
**Expiration :** Persistant, mais filtrage par session.

---

### Niveau 5 — Contexte lourd (JAMAIS automatique)

**Contenu :**
- Fichiers > 500 lignes (envoyés par page, jamais en entier sauf demande explicite)
- Logs complets de terminal
- Historique complet du thread (au-delà des 5 derniers tours)
- Arborescence complète du workspace
- node_modules, dist, build, .next, out, vendor

**Quand l'envoyer :** JAMAIS automatiquement.
**Méthode :** Pagination (`read_file` avec `start_line/end_line`), lazy loading, résumé.
**Taille max :** 0 en automatique. Sur demande explicite : limité par le budget restant.

---

### Tableau de décision du Smart Context Manager

| Signal de la requête | Niveaux activés | Tokens estimés |
|---|---|---|
| "bonjour" / question simple | 0 | ~200 |
| "explique ce code" (fichier actif) | 0 + 1 | ~1500 |
| "corrige cette erreur" (erreur visible) | 0 + 1 + 2 | ~3000 |
| "refactore @file.ts" (mention fichier) | 0 + 1 + 2 + 3 | ~6000 |
| Agent multi-tour (5e tour) | 0 + 1 + 2 + 3 + 4 | ~8000 |
| "explique tout le projet" | 0 + 2 + 3 (paginated) | ~5000 |

---

## 3. Context Budget Manager

### Architecture `ContextBudgetManager`

**Nouveau fichier :** `src/vs/workbench/contrib/void/browser/contextBudgetService.ts`

Le budget est calculé **avant** la construction du prompt, pas après.

### 3.1 Allocation du budget

```typescript
interface ContextBudget {
  totalAvailable: number;       // contextWindow - reservedOutput - safetyMargin
  systemPrompt: number;         // max 10% du total
  userRules: number;            // max 5%
  immediateContext: number;     // max 15%
  requestedContext: number;     // max 20%
  toolResults: number;          // max 25%
  history: number;              // max 20%
  memory: number;               // max 5%
}

interface BudgetAllocation {
  modelName: string;
  contextWindow: number;
  reservedOutput: number;
  safetyMargin: number;         // 5% du contextWindow
  budgetPerLevel: Record<0|1|2|3|4|5, number>;
}
```

### 3.2 Formule de calcul

```
totalBudget = contextWindow - reservedOutputTokenSpace - safetyMargin(5%)

Allocation par défaut (mode agent) :
  Level 0 (toujours)          :  3% → max  ~400 tokens
  Level 1 (immédiat)          : 12% → max ~1600 tokens
  Level 2 (demandé)           : 20% → max ~2600 tokens
  Level 3 (outils)            : 30% → max ~4000 tokens
  Level 4 (mémoire)           :  5% → max  ~650 tokens
  History (tours précédents)  : 25% → max ~3300 tokens
  Réserve non allouée         :  5% → ~650 tokens (overflow)

Allocation par défaut (mode normal — pas d'outils) :
  Level 0 (toujours)          :  5% → max  ~250 tokens
  Level 1 (immédiat)          : 25% → max ~1250 tokens
  Level 2 (demandé)           : 35% → max ~1750 tokens
  Level 4 (mémoire)           :  5% → max  ~250 tokens
  History                     : 25% → max ~1250 tokens
  Réserve                     :  5% → ~250 tokens
```

### 3.3 Adaptation dynamique

Le budget s'adapte selon :

1. **Nombre de tours déjà effectués** :
   - Tour 1 : history = 0, budget redirigé vers Level 1-2
   - Tour 5+ : history = 40%, niveaux 1-2 réduits

2. **Taille du modèle** :
   - Modèles 32K (DeepSeek, Groq) : allocations strictes, compression agressive
   - Modèles 128K+ (GPT-4.1, Claude) : allocations plus larges
   - Modèles 1M+ (Gemini 2.5) : allocations relaxées

3. **Coût du modèle** :
   - Modèles chers (>$5/M input) : budget strict, compression maximale
   - Modèles moyens ($0.5-5/M) : budget standard
   - Modèles gratuits/locaux : budget maximal, peu de compression

### 3.4 Fichier d'implémentation cible

**`src/vs/workbench/contrib/void/browser/contextBudgetService.ts`**

```typescript
export interface IContextBudgetService {
  readonly _serviceBrand: undefined;

  // Calcule le budget pour une requête donnée
  computeBudget(params: {
    modelSelection: ModelSelection;
    chatMode: ChatMode;
    turnNumber: number;
    historyLength: number;
  }): BudgetAllocation;

  // Vérifie si un élément rentre dans le budget restant
  canFit(element: ContextElement, remainingBudget: number): boolean;

  // Estime le coût en tokens d'un texte
  estimateTokens(text: string): number;

  // Estime le coût monétaire d'une requête
  estimateCost(params: {
    inputTokens: number;
    outputTokens: number;
    modelSelection: ModelSelection;
    isCached: boolean;
  }): { inputCost: number; outputCost: number; totalCost: number };
}
```

### 3.5 Intégration dans le flux existant

**Modification de `convertToLLMMessageService.ts`** (ligne 584) :

```typescript
// AVANT (actuel) :
private _generateChatMessagesSystemMessage = async (chatMode, specialToolFormat) => {
  const directoryStr = await this.directoryStrService.getAllDirectoriesStr({ cutOffMessage: '...' })
  // ... construit tout le système prompt sans budget
}

// APRÈS (optimisé) :
private _generateChatMessagesSystemMessage = async (chatMode, specialToolFormat, budget: BudgetAllocation) => {
  const directoryStr = await this.directoryStrService.getAllDirectoriesStr({
    cutOffMessage: '...',
    maxChars: budget.budgetPerLevel[3] * 4 // convertir tokens → chars
  })
  // ... construit le système prompt EN RESPECTANT le budget par niveau
}
```

---

## 4. Routage intelligent des modèles

### 4.1 Architecture `ModelRouter`

**Nouveau fichier :** `src/vs/workbench/contrib/void/browser/modelRouterService.ts`

Le Model Router choisit automatiquement le meilleur modèle en fonction de la tâche.

### 4.2 Classification des tâches

```typescript
type TaskComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';

interface TaskClassification {
  complexity: TaskComplexity;
  requiresTools: boolean;
  requiresReasoning: boolean;
  estimatedTurns: number;
  domain: 'code-edit' | 'code-review' | 'explanation' | 'generation' | 'debugging' | 'planning';
}
```

**Signaux pour classifier :**

| Signal | Poids | Exemple |
|---|---|---|
| Longueur du message user | faible | < 20 chars → trivial |
| Mots-clés ("refactor", "architect", "design") | moyen | → complex/expert |
| Nombre de fichiers mentionnés | moyen | > 3 → complex |
| Mode (agent vs normal) | fort | agent → au moins moderate |
| Erreur visible | moyen | → simple/moderate |
| Historique du thread (multi-tour) | moyen | > 5 tours → complex |

### 4.3 Matrice de routage modèle

```
Trivial  → gpt-4.1-nano ($0.10/M) ou deepseek-chat ($0.14/M) ou modèle local
Simple   → gpt-4.1-mini ($0.40/M) ou deepseek-chat ($0.14/M)
Moderate → gpt-4.1 ($2/M) ou claude-3.5-haiku ($0.80/M)
Complex  → claude-sonnet-4 ($3/M) ou gpt-4.1 ($2/M)
Expert   → claude-opus-4 ($15/M) ou o3 ($10/M) — seulement si explicitement activé
```

**Modèles low-cost prioritaires :**
- **DeepSeek Chat** : $0.14/$0.28 (input/output) — excellent pour le code
- **DeepSeek R1 (via OpenRouter)** : gratuit en mode free
- **Gemini 2.5 Flash** : $0.15/$0.60 — fenêtre 1M, rapide
- **GPT-4.1-nano** : $0.10/$0.40 — ultra rapide, bon pour les tâches simples
- **Mistral Devstral (free)** : gratuit via OpenRouter
- **Groq (qwen-qwq-32b)** : gratuit/très bon marché, ultra rapide

### 4.4 Fallback et retry intelligent

**Modification de `chatThreadService.ts`** (lignes 893-917) :

```typescript
// Au lieu de retry le même modèle 3 fois avec le même payload :
// 1. Si erreur rate-limit → switch provider (même tier)
// 2. Si erreur context trop long → compresser + retry même modèle
// 3. Si erreur timeout → retry avec modèle plus rapide
// 4. Si erreur qualité (hallucination détectée) → upgrade modèle

interface FallbackStrategy {
  primary: ModelSelection;
  fallbacks: ModelSelection[];  // ordonnés par préférence
  downgrade: ModelSelection;    // modèle moins cher pour tâches simples
}
```

### 4.5 Implémentation dans GlobalSettings

**Modification de `voidSettingsTypes.ts`** :

```typescript
export type GlobalSettings = {
  // ... existant ...
  // Nouveau :
  modelRouter: {
    enabled: boolean;
    primaryModel: ModelSelection;         // Pour tâches complex+
    economyModel: ModelSelection;         // Pour tâches trivial/simple
    fallbackModels: ModelSelection[];     // En cas d'erreur
    autoClassify: boolean;               // Classification auto de la complexité
    maxCostPerDay: number;               // Budget max $/jour (0 = illimité)
  };
}
```

---

## 5. Prompt Caching

### 5.1 Opportunités de cache identifiées

Anthropic et OpenAI supportent le **prompt caching** (cache_read à 90% moins cher que input). Void n'utilise **aucun** mécanisme de cache actuellement.

**Éléments cachables (stables entre requêtes) :**

| Élément | Stabilité | Taille | Économie cache |
|---|---|---|---|
| System prompt (level 0) | Session entière | ~400 tokens | 90% |
| Tool definitions | Session entière | ~1500 tokens | 90% |
| User rules | Session entière | ~500 tokens | 90% |
| Web guidelines | Session entière | ~300 tokens | 90% |
| Important details | Session entière | ~1200 tokens | 90% |
| Directory structure | ~5 min | ~5000 tokens | 90% (si stable) |
| **Total cachable** | | **~9000 tokens** | **~$0.027 → $0.003/requête** (Anthropic) |

### 5.2 Architecture du cache

**Principe :** Le prompt est découpé en **blocs ordonnés** dont les premiers sont stables (cachables).

```
┌──────────────────────────────┐ ← cache_control: ephemeral=false
│ Level 0: Agent role          │   (toujours identique)
│ User Rules                   │
│ Tool Definitions             │
│ Important Details            │
│ Web Guidelines               │
├──────────────────────────────┤ ← Point de cache Anthropic
│ Level 1: System Info         │   (change rarement)
│ Directory Structure          │
├──────────────────────────────┤ ← Peut être caché si stable
│ Level 2-4: Context variable  │   (change à chaque tour)
│ History                      │
│ User message                 │
└──────────────────────────────┘ ← Non cachable
```

### 5.3 Implémentation côté Anthropic

**Modification du payload dans `electron-main/llmMessage/sendLLMMessage.impl.ts`** :

```typescript
// Anthropic supporte cache_control sur les messages système et les premiers messages
// Ref: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

// Le system message doit être un tableau avec cache_control
system: [
  {
    type: "text",
    text: stableSystemPrompt,  // Level 0 + rules + tools + details
    cache_control: { type: "ephemeral" }  // cache pour 5 min
  },
  {
    type: "text",
    text: variableSystemPart   // sysInfo + directoryStr
  }
]
```

### 5.4 Implémentation côté OpenAI

OpenAI cache automatiquement les préfixes stables de >1024 tokens. Pour maximiser le hit rate :
- **Ordonner** le system prompt du plus stable au moins stable.
- **Ne jamais changer l'ordre** des blocs entre requêtes d'un même thread.

### 5.5 Cache local (cross-tours)

**Nouveau mécanisme côté client :**

```typescript
interface LocalContextCache {
  // Hash du contenu → résultat compressé
  fileContentHash: Map<string, { summary: string; tokens: number; timestamp: number }>;

  // Résultats d'outils déjà vus
  toolResultCache: Map<string, { compressed: string; fullHash: string; ttl: number }>;

  // Directory string (invalidé sur changement fichier)
  directoryStrCache: { value: string; timestamp: number; hash: string } | null;
}
```

**Avantage :** Si l'agent lit le même fichier 2 fois dans un thread, la 2e fois on peut envoyer un résumé au lieu du contenu complet.

### 5.6 Économies estimées avec le caching

| Scénario (5 tours agent) | Sans cache | Avec cache | Économie |
|---|---|---|---|
| Tokens input totaux | 50 000 | 50 000 | - |
| Tokens facturés input (Anthropic) | 50 000 × $3/M | 9 000 × $3/M + 41 000 × $0.30/M | **-78%** |
| Tokens facturés input (OpenAI GPT-4.1) | 50 000 × $2/M | 9 000 × $2/M + 41 000 × $0.50/M | **-59%** |
| Coût par session (Anthropic Sonnet) | $0.15 | $0.04 | **$0.11 économisé** |
| Coût par session (GPT-4.1) | $0.10 | $0.04 | **$0.06 économisé** |

---

## 6. Compression du contexte

### 6.1 Stratégies de compression par type

#### A. Fichiers source (read_file results)

**Actuel :** Envoi brut jusqu'à 500K chars (`MAX_FILE_CHARS_PAGE`).

**Optimisé :**
1. **Extraction intelligente** : Seules les parties pertinentes sont envoyées.
2. **Compression structurelle** : Garder imports + signatures + zone pertinente, remplacer le reste par des marqueurs.
3. **Pagination active** : Max 200 lignes par page au lieu du fichier entier.

```typescript
// Nouveau: compressFile dans smartContextService.ts
function compressFileForContext(content: string, relevantRanges: Range[], maxTokens: number): string {
  const lines = content.split('\n');
  const result: string[] = [];

  // Toujours garder : imports (premières lignes), exports, signatures
  const importLines = lines.filter((l, i) => i < 20 && /^(import|export|from|require)/.test(l.trim()));
  result.push(...importLines);

  // Garder les zones pertinentes ±10 lignes
  for (const range of relevantRanges) {
    const start = Math.max(0, range.startLineNumber - 10);
    const end = Math.min(lines.length, range.endLineNumber + 10);
    result.push(`\n// ... (lines ${start + 1}-${end}) ...`);
    result.push(...lines.slice(start, end));
  }

  // Si trop long, tronquer et ajouter marqueur
  const text = result.join('\n');
  if (estimateTokens(text) > maxTokens) {
    return text.slice(0, maxTokens * 4) + '\n// ... truncated ...';
  }
  return text;
}
```

#### B. Résultats de terminal (run_command)

**Actuel :** `MAX_TERMINAL_CHARS = 100_000` chars envoyés bruts.

**Optimisé :**
1. Garder seulement les 30 dernières lignes significatives.
2. Filtrer les lignes de progression (barres de chargement, pourcentages).
3. Prioriser les lignes d'erreur (stderr).
4. Max 2000 chars par résultat de commande.

```typescript
function compressTerminalOutput(output: string, maxChars: number = 2000): string {
  const lines = output.split('\n');

  // Priorité 1: lignes d'erreur
  const errorLines = lines.filter(l => /error|fail|exception|warn/i.test(l));

  // Priorité 2: dernières lignes
  const lastLines = lines.slice(-20);

  // Combiner sans dépasser maxChars
  const result = [...new Set([...errorLines.slice(-10), ...lastLines])];
  return result.join('\n').slice(0, maxChars);
}
```

#### C. Directory structure (directoryStr)

**Actuel :** `MAX_DIRSTR_CHARS_TOTAL_BEGINNING = 20_000` chars.

**Optimisé :**
1. Profondeur 2 par défaut (au lieu de 3).
2. Max 30 entrées par dossier (au lieu de `Infinity` initial).
3. Cacher les fichiers non pertinents (.test, .spec, .stories, .d.ts, .map, .lock).
4. Taille cible : 5000 chars max (au lieu de 20000).

**Modification dans `directoryStrService.ts`** (ligne 19-24) :

```typescript
// AVANT :
const START_MAX_DEPTH = Infinity;
const START_MAX_ITEMS_PER_DIR = Infinity;
const MAX_DIRSTR_CHARS_TOTAL_BEGINNING = 20_000;

// APRÈS :
const START_MAX_DEPTH = 2;          // Réduit de Infinity à 2
const START_MAX_ITEMS_PER_DIR = 30;  // Réduit de Infinity à 30
const MAX_DIRSTR_CHARS_TOTAL_BEGINNING = 5_000;  // Réduit de 20K à 5K
```

#### D. Historique de conversation (summarization)

**Actuel :** Tous les messages précédents sont envoyés intégralement.

**Optimisé — mécanisme de summarization progressive :**

```typescript
interface HistoryCompression {
  // Tours récents (derniers 3) : envoyés intégralement
  recentTurns: SimpleLLMMessage[];

  // Tours anciens : résumés en 1 paragraphe par tour
  summarizedTurns: string;  // "Turn 1: User asked X, assistant did Y. Turn 2: ..."

  // Très anciens (> 10 tours) : résumé global de 2-3 phrases
  globalSummary: string;
}

function compressHistory(messages: SimpleLLMMessage[], maxTokens: number): HistoryCompression {
  const turns = groupByTurns(messages);

  if (estimateTokens(messages) <= maxTokens) {
    return { recentTurns: messages, summarizedTurns: '', globalSummary: '' };
  }

  // Garder les 3 derniers tours intacts
  const recent = turns.slice(-3).flat();
  const remaining = maxTokens - estimateTokens(recent);

  // Résumer les tours précédents
  const olderTurns = turns.slice(0, -3);
  const summaries = olderTurns.map((turn, i) => {
    const userMsg = turn.find(m => m.role === 'user')?.content?.slice(0, 100) || '';
    const assistantAction = turn.find(m => m.role === 'assistant')?.content?.slice(0, 100) || '';
    return `[Turn ${i + 1}] User: ${userMsg}... → Assistant: ${assistantAction}...`;
  });

  return {
    recentTurns: recent,
    summarizedTurns: summaries.join('\n').slice(0, remaining * 4),
    globalSummary: ''
  };
}
```

#### E. Descriptions d'outils (tool definitions)

**Actuel :** 14 outils × ~400 chars = ~5600 chars envoyés.

**Optimisé :**
1. Descriptions raccourcies (max 100 chars par outil au lieu de 200-400).
2. Paramètres optionnels omis de la description (documentés in-code uniquement).
3. En mode gather : seuls 6 outils (read/search/list) au lieu de 14.

```typescript
// Descriptions compactes :
const compactToolDescriptions: Record<BuiltinToolName, string> = {
  read_file: 'Read file contents (supports pagination).',
  edit_file: 'Edit file with SEARCH/REPLACE blocks.',
  create_file_or_folder: 'Create file or folder.',
  delete_file_or_folder: 'Delete file or folder.',
  ls_dir: 'List directory contents.',
  get_dir_tree: 'Get directory tree structure.',
  search_pathnames_only: 'Search filenames in workspace.',
  search_for_files: 'Search file contents (grep).',
  search_in_file: 'Find string occurrences in a file.',
  read_lint_errors: 'Get lint errors for a file.',
  rewrite_file: 'Overwrite entire file content.',
  run_command: 'Run terminal command (waits for result).',
  run_persistent_command: 'Run command in persistent terminal.',
  open_persistent_terminal: 'Open long-running terminal.',
  kill_persistent_terminal: 'Kill persistent terminal.',
};
// Économie : ~2000 chars → ~500 tokens en moins
```

---

### 6.2 Tableau récapitulatif des compressions

| Élément | Taille actuelle | Taille optimisée | Réduction |
|---|---|---|---|
| directoryStr | 20 000 chars | 5 000 chars | **-75%** |
| Tool definitions (XML) | 5 600 chars | 2 800 chars | **-50%** |
| read_file result | 500 000 chars max | 8 000 chars max | **-98%** |
| Terminal output | 100 000 chars max | 2 000 chars max | **-98%** |
| importantDetails | 5 000 chars | 2 000 chars | **-60%** |
| webGuidelinesBlock | 1 200 chars | 400 chars (ou omis) | **-67%** |
| Historique (5 tours) | 40 000 chars | 12 000 chars | **-70%** |

**Réduction totale estimée du contexte moyen : 60-80%**

---

## 7. Plan d'implémentation

### Phase 1 — Quick Wins (1-2 jours)

Modifications minimales dans les fichiers existants, impact immédiat.

#### Étape 1.1 : Réduire directoryStr

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts`

```typescript
// Ligne 20-21, modifier :
export const MAX_DIRSTR_CHARS_TOTAL_BEGINNING = 5_000   // était 20_000
export const MAX_DIRSTR_RESULTS_TOTAL_BEGINNING = 50    // était 100
```

**Fichier :** `src/vs/workbench/contrib/void/common/directoryStrService.ts`

```typescript
// Ligne 19-20, modifier :
const START_MAX_DEPTH = 2;               // était Infinity
const START_MAX_ITEMS_PER_DIR = 30;      // était Infinity
```

**Impact :** -15 000 chars/requête → ~3750 tokens économisés.

#### Étape 1.2 : Réduire les limites des outils

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts`

```typescript
// Lignes 26-31, modifier :
export const MAX_FILE_CHARS_PAGE = 50_000      // était 500_000
export const MAX_CHILDREN_URIs_PAGE = 100      // était 500
export const MAX_TERMINAL_CHARS = 8_000        // était 100_000
export const MAX_TERMINAL_INACTIVE_TIME = 6    // était 8
```

**Impact :** Réduit drastiquement la taille des résultats d'outils injectés.

#### Étape 1.3 : Compresser importantDetails

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts` (lignes 471-523)

Fusionner les instructions redondantes, raccourcir les descriptions. Objectif : passer de ~5000 chars à ~2500 chars.

#### Étape 1.4 : Rendre webGuidelinesBlock conditionnel au premier tour

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts` (ligne 550)

Ajouter une condition : n'envoyer `webGuidelinesBlock` que si c'est le premier tour de l'agent ou si la tâche est liée au frontend.

---

### Phase 2 — Context Budget Service (2-3 jours)

#### Étape 2.1 : Créer `contextBudgetService.ts`

**Fichier :** `src/vs/workbench/contrib/void/browser/contextBudgetService.ts`

Implémenter `IContextBudgetService` avec :
- `computeBudget()` — calcul du budget par niveau
- `estimateTokens()` — estimation rapide (chars / 3.5)
- `estimateCost()` — utilise `VoidStaticModelInfo.cost`

#### Étape 2.2 : Créer les types

**Fichier :** `src/vs/workbench/contrib/void/common/contextBudgetServiceTypes.ts`

Définir `BudgetAllocation`, `ContextElement`, `ContextLevel`.

#### Étape 2.3 : Intégrer dans `convertToLLMMessageService.ts`

Modifier `_generateChatMessagesSystemMessage()` pour accepter et respecter un `BudgetAllocation`.

#### Étape 2.4 : Enregistrer le service

**Fichier :** `src/vs/workbench/contrib/void/browser/void.contribution.ts`

```typescript
import './contextBudgetService.js'
```

---

### Phase 3 — Smart Context Manager (3-5 jours)

#### Étape 3.1 : Créer `smartContextService.ts`

**Fichier :** `src/vs/workbench/contrib/void/browser/smartContextService.ts`

Implémenter :
- `classifyContextLevel()` — détermine le niveau de chaque élément
- `gatherContext()` — collecte uniquement les niveaux nécessaires
- `compressElement()` — compresse selon le niveau et le budget

#### Étape 3.2 : History Summarization

Ajouter dans `chatThreadService.ts` :
- Résumé automatique des tours > 3 dans le thread courant
- Stockage du résumé dans le state du thread
- Injection du résumé au lieu de l'historique brut

#### Étape 3.3 : File Content Compression

Modifier `toolsService.ts` → `stringOfResult['read_file']` :
- Si le fichier est > 200 lignes, extraire seulement imports + signatures + zones pertinentes
- Stocker le hash du fichier lu pour détecter les doublons

#### Étape 3.4 : Tool Result Deduplication

Si un fichier a déjà été lu dans le même thread, envoyer :
```
[File already read in this thread — contents unchanged since last read]
```
au lieu du contenu complet.

---

### Phase 4 — Model Router (2-3 jours)

#### Étape 4.1 : Créer `modelRouterService.ts`

**Fichier :** `src/vs/workbench/contrib/void/browser/modelRouterService.ts`

- `classifyTask()` — analyse le message user et le contexte
- `selectModel()` — choisit le modèle optimal selon complexité + budget

#### Étape 4.2 : Modifier les settings

**Fichier :** `src/vs/workbench/contrib/void/common/voidSettingsTypes.ts`

Ajouter `modelRouter` dans `GlobalSettings`.

#### Étape 4.3 : Intégrer dans `chatThreadService.ts`

Modifier `_runLoop()` pour utiliser `modelRouterService.selectModel()` au lieu du `modelSelection` fixe.

#### Étape 4.4 : Fallback intelligent

Modifier la boucle de retry (lignes 820-917) :
- Sur erreur rate-limit : essayer `fallbackModels[0]`
- Sur erreur context-length : compresser + retry
- Sur 3 échecs : notifier l'utilisateur

---

### Phase 5 — Prompt Caching (2-3 jours)

#### Étape 5.1 : Réordonner le system prompt

**Fichier :** `src/vs/workbench/contrib/void/common/prompt/prompts.ts`

Modifier `chat_systemMessage()` pour placer les éléments stables en premier :
1. header (stable)
2. userRules (stable par session)
3. toolDefinitions (stable par session)
4. importantDetails (stable par session)
5. webGuidelines (stable par session)
6. --- point de cache ---
7. sysInfo (change rarement)
8. fsInfo/directoryStr (change parfois)

#### Étape 5.2 : Modifier le payload Anthropic

**Fichier :** `src/vs/workbench/contrib/void/electron-main/llmMessage/sendLLMMessage.impl.ts`

Séparer le system prompt en 2 blocs avec `cache_control` sur le premier.

#### Étape 5.3 : Cache local des résultats d'outils

**Fichier :** `src/vs/workbench/contrib/void/browser/smartContextService.ts`

Implémenter `LocalContextCache` pour éviter de ré-envoyer des fichiers déjà lus.

---

### Phase 6 — Dashboard de coûts (1-2 jours)

#### Étape 6.1 : Enrichir `voidBudgetService`

Calculer le coût réel en dollars par requête en utilisant `VoidStaticModelInfo.cost`.

#### Étape 6.2 : UI React

Créer un composant dans `browser/react/src/sidebar-tsx/` montrant :
- Coût cumulé de la session
- Tokens in/out par requête
- Modèle utilisé
- Taux de cache hit

---

### Résumé des fichiers à modifier/créer

| Action | Fichier | Phase |
|---|---|---|
| **Modifier** | `common/prompt/prompts.ts` | 1, 5 |
| **Modifier** | `common/directoryStrService.ts` | 1 |
| **Modifier** | `browser/convertToLLMMessageService.ts` | 2, 3 |
| **Modifier** | `browser/chatThreadService.ts` | 3, 4 |
| **Modifier** | `browser/toolsService.ts` | 3 |
| **Modifier** | `common/voidSettingsTypes.ts` | 4 |
| **Modifier** | `electron-main/llmMessage/sendLLMMessage.impl.ts` | 5 |
| **Modifier** | `browser/void.contribution.ts` | 2, 3, 4 |
| **Créer** | `common/contextBudgetServiceTypes.ts` | 2 |
| **Créer** | `browser/contextBudgetService.ts` | 2 |
| **Créer** | `browser/smartContextService.ts` | 3 |
| **Créer** | `browser/modelRouterService.ts` | 4 |

---

### Estimation de l'impact total

| Métrique | Avant | Après (toutes phases) | Amélioration |
|---|---|---|---|
| Tokens input moyens / requête agent | 15 000 | 5 000 | **-67%** |
| Coût moyen / session (5 tours, Anthropic) | $0.15 | $0.03 | **-80%** |
| Coût moyen / session (5 tours, DeepSeek) | $0.01 | $0.003 | **-70%** |
| Temps de réponse (moins de tokens à traiter) | 8-15s | 4-8s | **-50%** |
| Taux de cache hit (Anthropic) | 0% | 70-80% | **+80%** |
| Requêtes avant budget limit (100K/jour) | ~7 | ~20 | **×3** |

---

### Priorités de déploiement

```
Semaine 1: Phase 1 (Quick Wins) → Impact immédiat -50% tokens
Semaine 2: Phase 2 (Budget) + Phase 5.1 (Réordonnancement)
Semaine 3: Phase 3 (Smart Context)
Semaine 4: Phase 4 (Model Router) + Phase 5.2-5.3 (Cache)
Semaine 5: Phase 6 (Dashboard) + Tests + Tuning
```

---

## Annexe A — Comparatif coûts par modèle

| Modèle | Input $/M | Output $/M | Cache Read $/M | Fenêtre | Recommandé pour |
|---|---|---|---|---|---|
| DeepSeek Chat | 0.14 | 0.28 | — | 64K | Tâches simples/modérées, code |
| GPT-4.1-nano | 0.10 | 0.40 | 0.03 | 1M | Tâches triviales, classification |
| GPT-4.1-mini | 0.40 | 1.60 | 0.10 | 1M | Tâches simples, bonnes capacités |
| Gemini 2.5 Flash | 0.15 | 0.60 | — | 1M | Contexte très large, recherche |
| Claude 3.5 Haiku | 0.80 | 4.00 | 0.08 | 200K | Tâches modérées, rapide |
| GPT-4.1 | 2.00 | 8.00 | 0.50 | 1M | Tâches complexes |
| Claude Sonnet 4 | 3.00 | 6.00 | 0.30 | 200K | Agent, raisonnement, code |
| Claude 3.7 Sonnet | 3.00 | 15.00 | 0.30 | 200K | Agent avancé |
| o4-mini | 1.10 | 4.40 | 0.275 | 1M | Raisonnement, planning |
| DeepSeek R1 | 0.55 | 2.19 | — | 64K | Raisonnement low-cost |

## Annexe B — Formules d'estimation de tokens

```typescript
// Estimation rapide (sans tokenizer)
function estimateTokens(text: string): number {
  // Code source : ~3.5 chars/token en moyenne
  // Texte anglais : ~4 chars/token
  // Texte français : ~3 chars/token
  // JSON/XML structuré : ~3 chars/token
  const codeRatio = 3.5;
  return Math.ceil(text.length / codeRatio);
}

// Estimation de coût
function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: VoidStaticModelInfo,
  cachedInputTokens: number = 0
): number {
  const inputCost = ((inputTokens - cachedInputTokens) * model.cost.input +
                     cachedInputTokens * (model.cost.cache_read ?? model.cost.input)) / 1_000_000;
  const outputCost = (outputTokens * model.cost.output) / 1_000_000;
  return inputCost + outputCost;
}
```

---

---

## Annexe C — Mise à jour des modèles et providers

### C.1 Modèles obsolètes à SUPPRIMER

Dans `src/vs/workbench/contrib/void/common/modelCapabilities.ts`, les modèles OpenRouter suivants sont **obsolètes** et doivent être supprimés de `defaultModelsOfProvider.openRouter` :

```typescript
// À SUPPRIMER de openRouter :
'anthropic/claude-opus-4',          // → remplacé par claude-opus-4.7
'anthropic/claude-sonnet-4',        // → garder mais ajouter 4.5, 4.6
'qwen/qwen3-235b-a22b',            // → obsolète, remplacé par d'autres
'anthropic/claude-3.7-sonnet',      // → ancien, plus pertinent
'anthropic/claude-3.5-sonnet',      // → très ancien
'deepseek/deepseek-r1',            // → remplacé par deepseek-v4-pro
'deepseek/deepseek-r1-zero:free',  // → obsolète
'mistralai/devstral-small:free'    // → optionnel, peut rester si gratuit
```

Les modèles DeepSeek directs sont aussi obsolètes :
```typescript
// À SUPPRIMER de defaultModelsOfProvider.deepseek :
'deepseek-chat',      // → remplacé par deepseek-v4-flash
'deepseek-reasoner',  // → remplacé par deepseek-v4-pro
```

---

### C.2 Nouveaux modèles à AJOUTER

#### Provider OpenRouter (`defaultModelsOfProvider.openRouter`)

```typescript
openRouter: [
  // --- GRATUITS ---
  'google/gemma-4-26b-a4b-it:free',     // Gemma 4 26B MoE, FREE, 262K context
  'google/gemma-4-31b-it:free',          // Gemma 4 31B dense, FREE, 256K context

  // --- DeepSeek (via OpenRouter) ---
  'deepseek/deepseek-v4-flash',          // $0.14/$0.28, 1M context, ultra rapide
  'deepseek/deepseek-v4-pro',            // $0.435/$0.87, 1M context, raisonnement

  // --- Anthropic (via OpenRouter) ---
  'anthropic/claude-sonnet-4',           // $3/$15, 1M context
  'anthropic/claude-sonnet-4.5',         // $3/$15, 1M context
  'anthropic/claude-sonnet-4.6',         // $3/$15, 1M context
  'anthropic/claude-opus-4.7',           // $5/$25, 1M context, flagship

  // --- Google Gemini (via OpenRouter) ---
  'google/gemini-3-flash-preview',       // $0.50/$3, 1M context, thinking
  'google/gemini-3.1-pro-preview',       // frontier, 1M context

  // --- Z.AI / GLM (via OpenRouter) ---
  'z-ai/glm-5',                          // $0.60/$1.92, 202K context
  'z-ai/glm-4.7',                        // ~200K context, bon pour code
],
```

#### Provider DeepSeek direct (`defaultModelsOfProvider.deepseek`)

```typescript
deepseek: [
  'deepseek-v4-flash',    // Remplace deepseek-chat, $0.14/$0.28, 1M, 384K max output
  'deepseek-v4-pro',      // Remplace deepseek-reasoner, $0.435/$0.87, 1M, reasoning
],
```

#### Nouveau Provider : GLM / Z.AI (à ajouter)

**Fichier :** `src/vs/workbench/contrib/void/common/modelCapabilities.ts`

```typescript
// Ajouter dans defaultProviderSettings :
glm: {
  endpoint: 'https://open.bigmodel.cn/api/paas/v4',  // API OpenAI-compatible
  apiKey: '',
},

// Ajouter dans defaultModelsOfProvider :
glm: [
  'glm-4.7',       // Flagship, ~200K context, coding+agent
  'glm-4.7-flash', // Rapide, ~200K context
  'glm-5',         // Dernier flagship, 202K context
],
```

**Note :** L'API GLM (Z.AI / Zhipu) est **compatible OpenAI**, donc il suffit d'ajouter un provider `openAICompatible` custom OU de créer un provider dédié `glm` avec le même pattern que `deepseek`.

---

### C.3 Configuration des capabilities des nouveaux modèles

**À ajouter dans `modelCapabilities.ts`** (section des model options) :

```typescript
// ================ DEEPSEEK V4 ================
const deepseekModelOptions = {
  'deepseek-v4-flash': {
    contextWindow: 1_048_576,
    reservedOutputTokenSpace: 32_768,
    cost: { input: 0.14, output: 0.28, cache_read: 0.0028 },
    downloadable: false,
    supportsFIM: false,
    specialToolFormat: 'openai-style',
    supportsSystemMessage: 'system-role',
    reasoningCapabilities: {
      supportsReasoning: true,
      canTurnOffReasoning: true,
      canIOReasoning: true,
      openSourceThinkTags: ['<think>', '</think>'],
    },
  },
  'deepseek-v4-pro': {
    contextWindow: 1_048_576,
    reservedOutputTokenSpace: 65_536,
    cost: { input: 0.435, output: 0.87, cache_read: 0.0087 },
    downloadable: false,
    supportsFIM: false,
    specialToolFormat: 'openai-style',
    supportsSystemMessage: 'system-role',
    reasoningCapabilities: {
      supportsReasoning: true,
      canTurnOffReasoning: true,
      canIOReasoning: true,
      openSourceThinkTags: ['<think>', '</think>'],
      reasoningSlider: { type: 'effort_slider', values: ['low', 'high', 'xhigh'], default: 'high' },
    },
  },
} satisfies { [s: string]: VoidStaticModelInfo }

// ================ GLM / Z.AI ================
const glmModelOptions = {
  'glm-4.7': {
    contextWindow: 200_000,
    reservedOutputTokenSpace: 32_768,
    cost: { input: 0.50, output: 1.50 },  // estimation via OpenRouter
    downloadable: false,
    supportsFIM: false,
    specialToolFormat: 'openai-style',
    supportsSystemMessage: 'system-role',
    reasoningCapabilities: false,
  },
  'glm-4.7-flash': {
    contextWindow: 200_000,
    reservedOutputTokenSpace: 32_768,
    cost: { input: 0.20, output: 0.60 },  // estimation
    downloadable: false,
    supportsFIM: false,
    specialToolFormat: 'openai-style',
    supportsSystemMessage: 'system-role',
    reasoningCapabilities: false,
  },
  'glm-5': {
    contextWindow: 202_752,
    reservedOutputTokenSpace: 32_768,
    cost: { input: 0.60, output: 1.92 },
    downloadable: false,
    supportsFIM: false,
    specialToolFormat: 'openai-style',
    supportsSystemMessage: 'system-role',
    reasoningCapabilities: false,
  },
} satisfies { [s: string]: VoidStaticModelInfo }

// ================ ANTHROPIC (mise à jour) ================
// Ajouter dans anthropicModelOptions :
'claude-sonnet-4.5': {
  contextWindow: 1_000_000,
  reservedOutputTokenSpace: 16_384,
  cost: { input: 3.00, cache_read: 0.30, cache_write: 3.75, output: 15.00 },
  downloadable: false,
  supportsFIM: false,
  specialToolFormat: 'anthropic-style',
  supportsSystemMessage: 'separated',
  reasoningCapabilities: {
    supportsReasoning: true,
    canTurnOffReasoning: true,
    canIOReasoning: true,
    reasoningReservedOutputTokenSpace: 16384,
    reasoningSlider: { type: 'budget_slider', min: 1024, max: 16384, default: 4096 },
  },
},
'claude-sonnet-4.6': {
  contextWindow: 1_000_000,
  reservedOutputTokenSpace: 16_384,
  cost: { input: 3.00, cache_read: 0.30, cache_write: 3.75, output: 15.00 },
  downloadable: false,
  supportsFIM: false,
  specialToolFormat: 'anthropic-style',
  supportsSystemMessage: 'separated',
  reasoningCapabilities: {
    supportsReasoning: true,
    canTurnOffReasoning: true,
    canIOReasoning: true,
    reasoningReservedOutputTokenSpace: 16384,
    reasoningSlider: { type: 'budget_slider', min: 1024, max: 16384, default: 4096 },
  },
},
'claude-opus-4.7': {
  contextWindow: 1_000_000,
  reservedOutputTokenSpace: 128_000,
  cost: { input: 5.00, cache_read: 0.50, cache_write: 6.25, output: 25.00 },
  downloadable: false,
  supportsFIM: false,
  specialToolFormat: 'anthropic-style',
  supportsSystemMessage: 'separated',
  reasoningCapabilities: {
    supportsReasoning: true,
    canTurnOffReasoning: true,
    canIOReasoning: true,
    reasoningReservedOutputTokenSpace: 128000,
    reasoningSlider: { type: 'budget_slider', min: 1024, max: 32768, default: 8192 },
  },
},

// ================ GOOGLE GEMINI (mise à jour) ================
// Remplacer les anciens gemini 2.x par :
'gemini-3-flash-preview': {
  contextWindow: 1_048_576,
  reservedOutputTokenSpace: 65_536,
  cost: { input: 0.50, output: 3.00 },
  downloadable: false,
  supportsFIM: false,
  supportsSystemMessage: 'separated',
  specialToolFormat: 'gemini-style',
  reasoningCapabilities: {
    supportsReasoning: true,
    canTurnOffReasoning: true,
    canIOReasoning: false,
    reasoningSlider: { type: 'budget_slider', min: 1024, max: 16384, default: 4096 },
  },
},
'gemini-3.1-pro-preview': {
  contextWindow: 1_048_576,
  reservedOutputTokenSpace: 65_536,
  cost: { input: 2.50, output: 15.00 },
  downloadable: false,
  supportsFIM: false,
  supportsSystemMessage: 'separated',
  specialToolFormat: 'gemini-style',
  reasoningCapabilities: {
    supportsReasoning: true,
    canTurnOffReasoning: true,
    canIOReasoning: false,
    reasoningSlider: { type: 'budget_slider', min: 1024, max: 32768, default: 8192 },
  },
},
```

---

### C.4 Tableau comparatif complet des modèles recommandés (mis à jour)

| Modèle | Provider | Input $/M | Output $/M | Cache $/M | Contexte | Max Output | Catégorie |
|---|---|---|---|---|---|---|---|
| **GRATUITS** | | | | | | | |
| Gemma 4 26B A4B | OpenRouter | 0 | 0 | — | 262K | 32K | Free |
| Gemma 4 31B | OpenRouter | 0 | 0 | — | 256K | 32K | Free |
| **ULTRA LOW-COST** | | | | | | | |
| DeepSeek V4 Flash | DeepSeek / OR | 0.14 | 0.28 | 0.003 | 1M | 384K | Economy |
| DeepSeek V4 Flash | OpenRouter | 0.14 | 0.28 | — | 1M | 384K | Economy |
| **LOW-COST** | | | | | | | |
| DeepSeek V4 Pro | DeepSeek / OR | 0.435 | 0.87 | 0.009 | 1M | 384K | Value |
| GLM 4.7 Flash | OpenRouter | ~0.20 | ~0.60 | — | 200K | 32K | Value |
| Gemini 3 Flash Preview | OpenRouter | 0.50 | 3.00 | — | 1M | 65K | Value |
| GLM 5 | OpenRouter | 0.60 | 1.92 | — | 202K | — | Value |
| GLM 4.7 | OpenRouter | ~0.50 | ~1.50 | — | 200K | 32K | Value |
| **MID-RANGE** | | | | | | | |
| Claude Sonnet 4 | OpenRouter | 3.00 | 15.00 | 0.30 | 1M | 64K | Pro |
| Claude Sonnet 4.5 | OpenRouter | 3.00 | 15.00 | 0.30 | 1M | 128K | Pro |
| Claude Sonnet 4.6 | OpenRouter | 3.00 | 15.00 | 0.30 | 1M | 128K | Pro |
| Gemini 3.1 Pro Preview | OpenRouter | 2.50 | 15.00 | — | 1M | 65K | Pro |
| **HIGH-END** | | | | | | | |
| Claude Opus 4.7 | OpenRouter | 5.00 | 25.00 | 0.50 | 1M | 128K | Flagship |

---

### C.5 Providers actifs à configurer dans Void

| Provider | Type | Endpoint | API Compatible | Modèles |
|---|---|---|---|---|
| **DeepSeek** | Direct | `https://api.deepseek.com` | OpenAI + Anthropic | V4 Flash, V4 Pro |
| **GLM (Z.AI)** | Direct | `https://open.bigmodel.cn/api/paas/v4` | OpenAI | GLM 4.7, 4.7-Flash, GLM 5 |
| **OpenRouter** | Agrégateur | `https://openrouter.ai/api/v1` | OpenAI | Tous les modèles ci-dessus |
| **OpenAI Compatible** | Custom | (configurable) | OpenAI | Tout modèle OpenAI-compat |

---

### C.6 Implémentation du provider GLM

**Étape 1 — Ajouter `glm` dans `defaultProviderSettings`** (`modelCapabilities.ts`) :

```typescript
glm: {
  endpoint: 'https://open.bigmodel.cn/api/paas/v4',
  apiKey: '',
},
```

**Étape 2 — Ajouter le type** (`voidSettingsTypes.ts`) :

Le provider GLM utilise le même format que `openAICompatible` (endpoint + apiKey). Comme Void supporte déjà `openAICompatible`, il suffit de l'ajouter comme un **nouveau provider** dans `defaultProviderSettings` et `ProviderName`.

**Étape 3 — Ajouter dans `displayInfoOfProviderName`** :

```typescript
else if (providerName === 'glm') {
  return { title: 'GLM (Z.AI / Zhipu)', }
}
```

**Étape 4 — Ajouter dans `subTextMdOfProviderName`** :

```typescript
if (providerName === 'glm') return 'Get your [API Key here](https://open.bigmodel.cn/usercenter/apikeys). GLM uses OpenAI-compatible API format.'
```

**Alternative simplifiée :** Si tu ne veux pas créer un provider dédié, tu peux simplement utiliser `openAICompatible` avec l'endpoint GLM. L'utilisateur peut alors ajouter ses modèles GLM manuellement.

---

### C.7 Mise à jour de la matrice de routage (Section 4.3 du plan)

```
Trivial  → Gemma 4 26B (FREE) ou DeepSeek V4 Flash ($0.14/M)
Simple   → DeepSeek V4 Flash ($0.14/M) ou GLM 4.7-Flash ($0.20/M)
Moderate → DeepSeek V4 Pro ($0.435/M) ou Gemini 3 Flash ($0.50/M)
Complex  → Claude Sonnet 4.6 ($3/M) ou Gemini 3.1 Pro ($2.50/M)
Expert   → Claude Opus 4.7 ($5/M) — seulement si explicitement activé
```

**Économie par rapport à l'ancienne matrice :**
- Trivial : $0.10 → $0 (FREE avec Gemma 4) = **-100%**
- Simple : $0.40 → $0.14 = **-65%**
- Moderate : $2.00 → $0.435 = **-78%**
- Complex : $3.00 → $3.00 (identique, mais meilleur modèle 4.6)
- Expert : $15.00 → $5.00 = **-67%**

---

### C.8 Mise à jour de l'Annexe A (tableau de coûts corrigé)

| Modèle | Input $/M | Output $/M | Cache Read $/M | Fenêtre | Recommandé pour |
|---|---|---|---|---|---|
| Gemma 4 26B (free) | 0 | 0 | — | 262K | Classification, triage, tâches légères |
| Gemma 4 31B (free) | 0 | 0 | — | 256K | Code simple, conversation |
| DeepSeek V4 Flash | 0.14 | 0.28 | 0.003 | 1M | Code, agent rapide, everyday |
| GLM 4.7-Flash | ~0.20 | ~0.60 | — | 200K | Code rapide, alternative DeepSeek |
| DeepSeek V4 Pro | 0.435 | 0.87 | 0.009 | 1M | Raisonnement, agent complexe |
| Gemini 3 Flash Preview | 0.50 | 3.00 | — | 1M | Recherche, grand contexte |
| GLM 5 | 0.60 | 1.92 | — | 202K | Agent systèmes, long-horizon |
| Gemini 3.1 Pro Preview | 2.50 | 15.00 | — | 1M | Frontier, multimodal |
| Claude Sonnet 4.6 | 3.00 | 15.00 | 0.30 | 1M | Agent pro, code précis |
| Claude Opus 4.7 | 5.00 | 25.00 | 0.50 | 1M | Expert, async agents |

---

> **Document rédigé le 10 mai 2025 — Mis à jour le 10 mai 2025**
> Basé sur l'analyse du code source réel de Void IDE (`src/vs/workbench/contrib/void/`)
> Modèles vérifiés sur OpenRouter, DeepSeek API Docs, et Z.AI le 10 mai 2025

