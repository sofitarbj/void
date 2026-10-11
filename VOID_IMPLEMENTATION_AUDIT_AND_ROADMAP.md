# VOID IDE — Audit d'Architecture & Roadmap d'Implémentation Agentique

> **Objectif** : Cartographier l'architecture actuelle de Void IDE par rapport au blueprint `IDE_FINAL.md` (Agent "Codeen AI"), identifier les écarts fonctionnels, et définir un plan d'action pour transformer Void en un IDE agentique de niveau production.

---

## 1. Vue d'Ensemble de l'Architecture Existante

### 1.1 Organisation du Code

```
src/vs/workbench/contrib/void/
├── browser/                    # Process UI (React, services browser-side)
│   ├── chatThreadService.ts    # ★ Boucle agent + orchestration chat (1885 lignes)
│   ├── toolsService.ts         # Routage des appels d'outils (594 lignes)
│   ├── editCodeService.ts      # Gestion diffs/éditions inline (2466 lignes)
│   ├── terminalToolService.ts  # Gestion terminaux persistants/temporaires
│   ├── contextGatheringService.ts # Collecte contexte via symboles/définitions
│   └── react/src/              # Composants UI (sidebar, settings, widgets)
├── common/                     # Types partagés, prompts, configurations
│   ├── prompt/prompts.ts       # ★ Système de prompt + définitions d'outils (1070 lignes)
│   ├── toolsServiceTypes.ts    # Contrats d'outils et types d'approbation
│   ├── sendLLMMessageTypes.ts  # Types de messages LLM multi-providers
│   ├── modelCapabilities.ts    # Capabilities statiques de ~50+ modèles (1587 lignes)
│   ├── voidSettingsTypes.ts    # Schéma configuration providers/modèles
│   ├── mcpServiceTypes.ts      # Types MCP (JSON-RPC, serveurs)
│   └── mcpService.ts           # Service MCP (361 lignes)
├── electron-main/              # Process principal (Node.js, appels API)
│   └── llmMessage/
│       └── sendLLMMessage.impl.ts  # ★ Implémentation envoi LLM multi-providers (968 lignes)
```

### 1.2 Providers Supportés (16 total)

| Provider | API Key | Endpoint Custom | Tool Calling | Reasoning |
|---|---|---|---|---|
| Anthropic | ✅ | ❌ | `anthropic-style` | Budget slider |
| OpenAI | ✅ | ❌ | `openai-style` | Effort slider |
| Gemini | ✅ | ❌ | `gemini-style` | ThinkingConfig |
| **OpenRouter** | ✅ | ❌ (`openrouter.ai/api/v1`) | Via fallback modèle | Via fallback |
| DeepSeek | ✅ | ❌ | ❌ (XML fallback) | Think tags |
| Ollama | ❌ | ✅ (`127.0.0.1:11434`) | Via fallback | Via fallback |
| xAI (Grok) | ✅ | ❌ | `openai-style` | Effort slider |
| Groq | ✅ | ❌ | ❌ | ❌ |
| Mistral | ✅ | ❌ | ❌ (XML fallback) | ❌ |
| vLLM | ❌ | ✅ | Via fallback | Via fallback |
| LM Studio | ❌ | ✅ | Via fallback | Via fallback |
| LiteLLM | ❌ | ✅ | Via fallback | Via fallback |
| OpenAI Compatible | ✅ | ✅ | Via fallback | Via fallback |
| Google Vertex | ❌ | ✅ (region/project) | Via fallback | Via fallback |
| Microsoft Azure | ✅ | ✅ (resource) | Via fallback | Via fallback |
| AWS Bedrock | ✅ | ✅ (proxy) | Via fallback | Via fallback |

### 1.3 Outils Intégrés (Built-in)

| Outil | Mode | Approbation | Description |
|---|---|---|---|
| `read_file` | gather, agent | ❌ Auto | Lecture fichier avec pagination |
| `ls_dir` | gather, agent | ❌ Auto | Liste répertoire |
| `get_dir_tree` | gather, agent | ❌ Auto | Arbre de fichiers |
| `search_pathnames_only` | gather, agent | ❌ Auto | Recherche noms de fichiers |
| `search_for_files` | gather, agent | ❌ Auto | Recherche contenu fichiers |
| `search_in_file` | gather, agent | ❌ Auto | Recherche dans un fichier |
| `read_lint_errors` | gather, agent | ❌ Auto | Erreurs lint |
| `create_file_or_folder` | agent | ✅ Requise | Création fichier/dossier |
| `delete_file_or_folder` | agent | ✅ Requise | Suppression fichier/dossier |
| `edit_file` | agent | ✅ Requise | Édition via SEARCH/REPLACE |
| `rewrite_file` | agent | ✅ Requise | Réécriture complète |
| `run_command` | agent | ✅ Requise | Commande terminal temporaire |
| `run_persistent_command` | agent | ✅ Requise | Commande terminal persistant |
| `open_persistent_terminal` | agent | ✅ Requise | Ouverture terminal persistant |
| `kill_persistent_terminal` | agent | ✅ Requise | Fermeture terminal persistant |

---

## 2. Analyse Comparative : Void vs Blueprint IDE_FINAL.md

### 2.1 Matrice de Couverture Fonctionnelle

| Fonctionnalité Blueprint | Statut Void | Détails |
|---|---|---|
| **Boucle Agent Multi-Tours** | ✅ Implémenté | `chatThreadService.ts` L770-901 : boucle `while(shouldSendAnotherMessage)` avec retry |
| **Tool Calling (natif)** | ✅ Implémenté | 3 formats : `openai-style`, `anthropic-style`, `gemini-style` |
| **Tool Calling (XML fallback)** | ✅ Implémenté | `extractXMLToolsWrapper` pour modèles sans support natif |
| **Système d'Approbation** | ✅ Implémenté | `approvalTypeOfBuiltinToolName` + auto-approve configurable |
| **Support MCP** | ✅ Implémenté | `mcpService.ts` avec IPC channel `void-channel-mcp` |
| **Modes Chat** | ✅ Implémenté | `normal`, `gather`, `agent` avec outils filtrés par mode |
| **Prompts Dynamiques** | ⚠️ Partiel | Injection OS, workspace, fichiers ouverts — mais PAS de mémoire persistante |
| **Checkpoints/Undo** | ✅ Implémenté | Snapshots fichier via `_getCurrentVoidFileSnapshot` + `IUndoRedoService` |
| **Contexte Structurel** | ⚠️ Partiel | `contextGatheringService.ts` pour symboles — pas de graphe de dépendances |
| **Reasoning/Thinking** | ✅ Implémenté | Support `<think>` tags, budget sliders, effort sliders |
| **Streaming** | ✅ Implémenté | Streaming complet pour tous providers |
| **Retry avec Backoff** | ✅ Implémenté | 3 retries, 2500ms delay (`CHAT_RETRIES`, `RETRY_DELAY`) |
| **Mémoire Persistante** | ❌ Absent | Pas de `<memories>`, pas de KI, pas de conversation logs |
| **Planification (todo_list)** | ❌ Absent | Pas de système de plan/artefact interne |
| **Injection Dynamique XML** | ⚠️ Partiel | `<system_info>`, `<files_overview>` existent — pas `<context>`, `<memories>` |
| **Gatekeeping Sécurité** | ⚠️ Basique | Approbation utilisateur — pas de sandbox, pas de validation de commandes dangereuses |
| **Cost Tracking** | ⚠️ Informatif | `VoidStaticModelInfo.cost` présent mais pas de tracking en temps réel |
| **Multi-fichier Édition Atomique** | ✅ Implémenté | Via `editCodeService.ts` avec DiffZones |
| **FIM (Autocomplete)** | ✅ Implémenté | Support Ollama natif + Mistral FIM + OpenAI Compatible |

---

## 3. Analyse Détaillée des Écarts Critiques

### 3.1 ❌ Mémoire Persistante (P0 — Critique)

**Blueprint exige** : Système de Knowledge Items (KI), conversation logs, mémoire inter-sessions.

**État Void** : Les threads sont persistés via `StorageService` (clé `THREAD_STORAGE_KEY`), mais :
- Aucun système de résumé automatique des conversations
- Pas d'extraction de patterns/décisions pour réutilisation
- Pas de `<memories>` dans le prompt système
- Pas de `<persistent_context>` avec KI artifacts

**Impact** : L'agent ne peut pas apprendre de ses sessions passées. Chaque conversation repart de zéro.

**Fichiers concernés** :
- [prompts.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/prompt/prompts.ts#L428-L523) — `chat_systemMessage`
- [chatThreadService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/chatThreadService.ts#L396-L423) — `_storeAllThreads`

---

### 3.2 ❌ Système de Planification (P0 — Critique)

**Blueprint exige** : `implementation_plan.md`, `task.md`, `walkthrough.md` comme artefacts gérés par l'agent.

**État Void** : Aucun mécanisme de planification. L'agent exécute les instructions séquentiellement sans :
- Créer de plan avant l'exécution
- Découper les tâches complexes
- Tracker la progression
- Demander une validation utilisateur avant les changements majeurs

**Impact** : Pour les tâches complexes, l'agent risque de faire des modifications incorrectes sans vue d'ensemble.

---

### 3.3 ⚠️ Injection de Contexte Dynamique (P1 — Important)

**Blueprint exige** : Balises XML structurées (`<context>`, `<memories>`, `<user_rules>`, `<ephemeral_message>`).

**État Void** : Le prompt système utilise déjà des balises XML :
- `<system_info>` ✅ — OS, workspace, fichiers
- `<files_overview>` ✅ — Arbre de répertoires

**Manque** :
- `<user_rules>` — Règles personnalisées de l'utilisateur
- `<persistent_context>` — Contexte mémorisé
- `<web_application_development>` — Guidelines de développement
- `<planning_mode>` — Instructions de planification

**Fichier principal** : [prompts.ts:428-523](file:///e:/dev/void/src/vs/workbench/contrib/void/common/prompt/prompts.ts#L428-L523)

---

### 3.4 ⚠️ Sécurité Avancée (P1 — Important)

**Blueprint exige** : `SafeToAutoRun`, validation de commandes dangereuses, sandbox.

**État Void** : Système d'approbation existant (`approvalTypeOfBuiltinToolName`) avec :
- Auto-approve configurable par catégorie d'outil
- Pas de classification `safe/unsafe` par commande
- Pas de blocklist de commandes dangereuses (`rm -rf`, `DROP TABLE`, etc.)
- Pas de limite de budget API

**Fichiers concernés** :
- [toolsServiceTypes.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/toolsServiceTypes.ts) — Types d'approbation
- [chatThreadService.ts:622-653](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/chatThreadService.ts#L622-L653) — Logique d'approbation

---

### 3.5 ⚠️ Gestion d'Erreurs et Observabilité (P2)

**Blueprint exige** : Logs structurés, métriques de coût, fallback intelligent.

**État Void** :
- `IMetricsService` existe pour capture d'événements (`Agent Loop Done`, etc.)
- `VoidStaticModelInfo.cost` contient les coûts input/output par modèle
- Pas de compteur de tokens en temps réel
- Pas de fallback automatique entre providers
- Retry basique (3 tentatives, délai fixe)

---

## 4. Points Forts de l'Architecture Existante

### 4.1 Boucle Agent Robuste ✅

La boucle dans [chatThreadService.ts:770-901](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/chatThreadService.ts#L770-L901) est bien conçue :

```typescript
// Boucle principale — L770-901
while (shouldSendAnotherMessage) {
    shouldSendAnotherMessage = false
    nMessagesSent += 1
    
    // 1. Préparer messages LLM
    const { messages, separateSystemMessage } = await this._convertToLLMMessagesService.prepareLLMChatMessages(...)
    
    // 2. Envoyer au LLM avec retry
    while (shouldRetryLLM) { ... }
    
    // 3. Si tool call reçu → exécuter
    if (toolCall) {
        const { awaitingUserApproval, interrupted } = await this._runToolCall(...)
        if (!awaitingUserApproval) shouldSendAnotherMessage = true // ← BOUCLE MULTI-TOURS
    }
}
```

**Caractéristiques clés** :
- Multi-tours autonome (continue tant qu'il y a des tool calls)
- Interruption propre à chaque étape
- Gestion d'état par thread (multiple conversations simultanées)
- Retry avec backoff

### 4.2 Architecture Multi-Provider Mature ✅

[sendLLMMessage.impl.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/electron-main/llmMessage/sendLLMMessage.impl.ts) gère 16 providers avec :
- Conversion automatique des formats d'outils (OpenAI → Anthropic → Gemini → XML)
- Parsing des `<think>` tags pour modèles open-source
- `extensiveModelOptionsFallback` pour reconnaissance intelligente des modèles

### 4.3 MCP Pleinement Opérationnel ✅

[mcpService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/mcpService.ts) :
- Communication IPC avec le main process via `void-channel-mcp`
- Hot-reload de la config (`mcp.json` watch)
- Toggle on/off par serveur
- Transformation automatique `inputSchema → InternalToolInfo`

### 4.4 Système d'Édition Avancé ✅

[editCodeService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/editCodeService.ts) (2466 lignes) :
- DiffZones avec streaming en temps réel
- Accept/Reject inline par diff
- Undo/Redo via `IUndoRedoService` avec snapshots complets
- CtrlK (quick edit) avec viewzones intégrées

---

## 5. Roadmap d'Implémentation

### Phase 0 — Stabilisation & Validation (Semaine 1)
> **Objectif** : S'assurer que le build fonctionne et que les fonctionnalités existantes sont stables.

- [ ] Vérifier le build complet de Void (`yarn watch`)
- [ ] Tester la boucle agent avec OpenRouter (provider principal du blueprint)
- [ ] Valider le support MCP avec un serveur de test
- [ ] Documenter les erreurs de build existantes

---

### Phase 1 — Mémoire Persistante (Semaines 2-3) — **P0**
> **Objectif** : Permettre à l'agent de conserver et réutiliser le contexte entre sessions.

#### 1.1 Knowledge Items (KI)
- [ ] Créer `common/memoryService.ts` — Service de mémoire persistante
- [ ] Définir le format KI : `{ summary, artifacts[], references[], timestamps }`
- [ ] Stocker les KI via `IFileService` dans `~/.void/knowledge/`
- [ ] Injection dans le prompt via nouvelle balise `<persistent_context>`

#### 1.2 Conversation Summaries
- [ ] Extraction automatique de résumés à la fin de chaque conversation
- [ ] Stockage dans `~/.void/brain/{conversation-id}/`
- [ ] Injection des résumés pertinents dans le prompt

#### Fichiers à modifier :
- `common/prompt/prompts.ts` — Ajouter `<persistent_context>` dans `chat_systemMessage`
- `browser/chatThreadService.ts` — Appeler le service mémoire en fin de thread

---

### Phase 2 — Système de Planification (Semaines 3-4) — **P0**
> **Objectif** : L'agent planifie avant d'exécuter.

#### 2.1 Planning Mode
- [ ] Ajouter un mode `planning` dans `ChatMode` (`voidSettingsTypes.ts`)
- [ ] Créer les artefacts : `implementation_plan.md`, `task.md`, `walkthrough.md`
- [ ] L'agent crée automatiquement un plan pour les tâches complexes
- [ ] Validation utilisateur obligatoire avant exécution du plan

#### 2.2 Task Tracking
- [ ] Ajout d'un outil built-in `update_task` pour tracker la progression
- [ ] Format checklist `[ ]`, `[/]`, `[x]`
- [ ] Affichage dans le panel sidebar

#### Fichiers à modifier :
- `common/voidSettingsTypes.ts` — Nouveau `ChatMode`
- `common/prompt/prompts.ts` — Logique de planification dans le prompt
- `common/toolsServiceTypes.ts` — Nouveau type d'outil `update_task`

---

### Phase 3 — Injection Dynamique de Contexte (Semaines 4-5) — **P1**
> **Objectif** : Prompt système riche et dynamique.

#### 3.1 User Rules
- [ ] Lire un fichier `~/.void/user_rules.md` au démarrage
- [ ] Injection dans `<user_rules>` dans le prompt système
- [ ] UI pour éditer les règles dans les settings

#### 3.2 Web Application Guidelines
- [ ] Template de guidelines pour le développement web
- [ ] Injection conditionnelle selon le type de projet détecté
- [ ] Balise `<web_application_development>` avec stack recommandée

#### 3.3 Context Engineering Avancé
- [ ] Évaluation dynamique de la pertinence des fichiers ouverts
- [ ] Limitation intelligente du contexte selon la fenêtre du modèle
- [ ] Utilisation du `contextWindow` de `VoidStaticModelInfo` pour optimiser

#### Fichiers à modifier :
- `common/prompt/prompts.ts` — Refactoring complet de `chat_systemMessage`
- `common/voidSettingsService.ts` — Gestion des user rules

---

### Phase 4 — Sécurité Avancée (Semaine 5) — **P1**
> **Objectif** : Protection contre les actions destructives.

#### 4.1 Command Safety Classification
- [ ] Classifier les commandes terminal : `safe`, `unsafe`, `destructive`
- [ ] Blocklist configurable (`rm -rf /`, `DROP DATABASE`, `format`, etc.)
- [ ] Override par l'utilisateur avec confirmation explicite

#### 4.2 Budget & Rate Limiting
- [ ] Compteur de tokens en temps réel via `VoidStaticModelInfo.cost`
- [ ] Limite de coût par session (configurable)
- [ ] Alerte quand le budget approche

#### Fichiers à modifier :
- `common/toolsServiceTypes.ts` — Ajouter `SafetyLevel` enum
- `browser/toolsService.ts` — Validation pré-exécution
- `browser/terminalToolService.ts` — Classification des commandes

---

### Phase 5 — Observabilité & Fallback (Semaine 6) — **P2**
> **Objectif** : Logging structuré et résilience.

- [ ] Compteur de tokens live dans l'UI sidebar
- [ ] Fallback automatique entre providers (si erreur 429/500)
- [ ] Export des logs de conversation en format structuré
- [ ] Dashboard de métriques (tokens consommés, outils utilisés, erreurs)

---

## 6. Dépendances et Risques

### Risques Techniques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Race conditions multi-thread | Moyenne | Élevé | Locks explicites sur `editCodeService` |
| Dépassement contexte modèle | Élevée | Moyen | Truncation intelligente + pagination |
| Incompatibilité MCP servers | Faible | Moyen | Tests avec serveurs MCP courants |
| Perte de données mémoire | Moyenne | Élevé | Backup atomique + versioning |
| Régression UI | Faible | Faible | Tests visuels via React storybook |

### Dépendances Externes

- **Electron IPC** : Communication browser ↔ main process pour LLM et MCP
- **VS Code APIs** : `IFileService`, `ITerminalService`, `IUndoRedoService`, `IStorageService`
- **SDKs** : `@anthropic-ai/sdk`, `openai`, `@google/genai`, `ollama`

---

## 7. Références Clés du Code

| Fichier | Lignes Clés | Rôle |
|---|---|---|
| [chatThreadService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/chatThreadService.ts) | L770-901 | Boucle agent multi-tours |
| [chatThreadService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/chatThreadService.ts) | L605-727 | `_runToolCall` — exécution d'outil |
| [prompts.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/prompt/prompts.ts) | L186-345 | Définitions des 15 outils built-in |
| [prompts.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/prompt/prompts.ts) | L428-523 | `chat_systemMessage` — prompt système |
| [sendLLMMessage.impl.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/electron-main/llmMessage/sendLLMMessage.impl.ts) | L72-172 | Factory SDK multi-providers |
| [sendLLMMessage.impl.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/electron-main/llmMessage/sendLLMMessage.impl.ts) | L273-388 | `_sendOpenAICompatibleChat` |
| [toolsService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/toolsService.ts) | L1-594 | Routage et exécution des outils |
| [mcpService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/mcpService.ts) | L1-361 | Service MCP complet |
| [modelCapabilities.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/modelCapabilities.ts) | L162-203 | `VoidStaticModelInfo` — capabilities |
| [modelCapabilities.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/modelCapabilities.ts) | L394-471 | `extensiveModelOptionsFallback` |
| [terminalToolService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/terminalToolService.ts) | L261-383 | `runCommand` — exécution terminal |
| [editCodeService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/editCodeService.ts) | L157-245 | DiffZone management |
| [voidSettingsTypes.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/common/voidSettingsTypes.ts) | L1-525 | Configuration complète |

---

## 8. Conclusion

**Void est déjà à ~65% du blueprint** `IDE_FINAL.md`. Les fondations sont solides :
- ✅ Boucle agent multi-tours fonctionnelle
- ✅ 16 providers LLM avec tool calling multi-format
- ✅ 15 outils built-in avec système d'approbation
- ✅ Support MCP opérationnel
- ✅ Streaming, retry, reasoning
- ✅ Édition inline avec diff/undo

**Les 35% manquants** se concentrent sur :
- ❌ **Mémoire persistante** (KI, résumés, contexte inter-sessions)
- ❌ **Planification** (plans, tâches, artefacts)
- ⚠️ **Sécurité avancée** (classification commandes, budget)
- ⚠️ **Context engineering dynamique** (user rules, guidelines adaptatives)

L'implémentation peut se faire de manière incrémentale sans casser l'existant, en s'appuyant sur l'architecture modulaire déjà en place.
