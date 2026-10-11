# Void — Implémentation Agentique — Task Tracker

## Phase 0 — Stabilisation ✅ (Build en cours)
- [x] Build confirmé actif (`watch-client`, `watchreact`, `watch-extensions`)
- [x] Architecture auditée et roadmap validée

---

## Phase 1 — Mémoire Persistante (P0) ✅

### 1.1 Service de Mémoire
- [x] Créer `common/voidMemoryServiceTypes.ts` — Types KI, user rules, memory state
- [x] Créer `common/voidMemoryService.ts` — Interface IVoidMemoryService
- [x] Créer `browser/voidMemoryService.ts` — Implémentation (IStorageService, FIFO max 20 KI)
- [x] Enregistrer le service via `registerSingleton` dans `void.contribution.ts`

### 1.2 Injection dans le Prompt Système
- [x] Ajouter paramètre `memoryContext` dans `chat_systemMessage` (optionnel, 0 overhead si vide)
- [x] Injecter `<user_rules>` et `<persistent_context>` (KI + résumé session)
- [x] Connecter `convertToLLMMessageService` → `voidMemoryService`

### 1.3 Extraction de Résumés (fin de session)
- [x] Appel `_saveThreadSummary` à la fin de la boucle agent (sans appel LLM supplémentaire)
- [x] Extrait dernier user + dernier assistant → persiste dans `IVoidMemoryService`

---

## Phase 2 — Planification (P0) ✅

- [x] Instructions de planification injectées dans le prompt agent
- [x] L'agent crée `implementation_plan.md` avant les tâches complexes
- [x] Maintient `task.md` (checkboxes) pendant l'exécution
- [x] Crée `walkthrough.md` après completion
- [x] Validation utilisateur demandée avant exécution du plan

---

## Phase 3 — Contexte Dynamique (P1) ✅

- [x] User rules persistantes fusionnées dans `_getCombinedAIInstructions`
- [x] Détection automatique de projet web via `directoryStr` (package.json, vite.config, next.config)
- [x] Bloc `<web_application_development>` conditionnel avec stack, design, SEO
- [x] Guidelines adaptatives : Next.js, Vite+React, ou framework existant

---

## Phase 4 — Sécurité (P1) ✅

### 4.1 Classification commandes terminal ✅
- [x] Créer `common/securityUtils.ts` — `classifyCommand()` (safe/moderate/destructive)
- [x] Patterns regex pour rm, sudo, curl|bash, git push, npm install, etc.
- [x] `isCommandSafeToAutoApprove()` et `getCommandWarning()`
- [x] Connecté dans `_runToolCall` — blocklist hard-block + classification warning avant exécution

### 4.2 Budget API ✅
- [x] Créer `common/voidBudgetServiceTypes.ts` — Types VoidBudgetState, limites, compteurs
- [x] Créer `common/voidBudgetService.ts` — Interface IVoidBudgetService
- [x] Créer `browser/voidBudgetService.ts` — Implémentation (reset quotidien automatique, IStorageService)
- [x] Enregistrer dans `void.contribution.ts`
- [x] Intégrer dans `chatThreadService.ts` — check budget avant `sendLLMMessage`, `recordRequest` après réponse

### 4.3 Blocklist terminal ✅
- [x] `isCommandBlocked()` dans `IVoidBudgetService`
- [x] Branché dans `_runToolCall` — rejette les commandes bloquées avec message d'erreur outil

---

## Phase 5 — Observabilité (P2) — ⏳ À faire

### 5.1 Exposition du budget service dans React
Le pattern est dans `browser/react/src/util/services.tsx`.
- [ ] Ajouter `IVoidBudgetService` et `IVoidMemoryService` dans `getReactAccessor` (ligne ~185)
- [ ] Enregistrer les listeners dans `_registerServices` pour `onDidChangeState`
- [ ] Créer `useBudgetState()` hook (sur le modèle de `useSettingsState`)
- [ ] Créer `useMemoryState()` hook

### 5.2 Compteur tokens live UI
- [ ] Ajouter badge/indicateur dans la sidebar chat affichant :
  - Requêtes aujourd'hui / max
  - Tokens estimés aujourd'hui / max
  - (Optionnel) requêtes cette session
- [ ] Composant `BudgetStatusBar` dans `sidebar-tsx/`

### 5.3 Fallback provider automatique
- [ ] Dans `chatThreadService.ts`, au `onError` de `sendLLMMessage` : si erreur `429` ou `quota`, tenter le prochain provider configuré
- [ ] Ajouter liste de fallback providers dans `GlobalSettings` (`fallbackProviders: ModelSelection[]`)
- [ ] UI dans les settings pour configurer les fallbacks

### 5.4 Export logs structurés
- [ ] Créer `browser/voidLogExportService.ts` — collecte des événements (requêtes, erreurs, tools)
- [ ] Bouton "Export session log" dans les settings → JSON téléchargeable
- [ ] Format : `{ timestamp, type, threadId, model, tokens, toolName?, error? }[]`

---

## Récapitulatif des fichiers créés dans cette session

| Fichier | Phase | Rôle |
|---|---|---|
| `common/voidMemoryServiceTypes.ts` | 1 | Types KI, MemoryState |
| `common/voidMemoryService.ts` | 1 | Interface IVoidMemoryService |
| `browser/voidMemoryService.ts` | 1 | Impl. mémoire persistante |
| `common/voidBudgetServiceTypes.ts` | 4 | Types Budget |
| `common/voidBudgetService.ts` | 4 | Interface IVoidBudgetService |
| `browser/voidBudgetService.ts` | 4 | Impl. budget + blocklist |
| `common/securityUtils.ts` | 4 | Classif. commandes shell |
