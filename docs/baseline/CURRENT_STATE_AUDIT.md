# Audit Technique de l'État Actuel du Projet Codeen

**Date de l'audit** : 2026-10-08  
**Répertoire Git racine** : `E:\dev\void`  
**Branche active** : `sofitar-update`  
**Dépôt distant (origin)** : `https://github.com/sofitarbj/void.git`  
**Upstream** : `https://github.com/voideditor/void.git`  

---

## 1. Identité et Métadonnées

- **Version VS Code amont (Base)** : VS Code (Code-OSS) `1.99.3` (`package.json`).
- **Nom du produit (`product.json`)** :
  - `nameShort`: `"Codeen"`
  - `nameLong`: `"Codeen"`
  - `applicationName`: `"void"`
  - `dataFolderName`: `".codeen"` (recommandé pour la migration)
- **Environnement de développement** : Windows (PowerShell), Node.js, Electron, TypeScript.

---

## 2. Inventaire des Modifications Locales Non Commités

Le statut Git actuel fait état d'un important chantier en cours (31 fichiers modifiés et 32 fichiers non suivis). Ces modifications doivent impérativement être préservées :

### 2.1 Fichiers Modifiés dans l'Arborescence Git (31 fichiers)
- **Core / Configuration** :
  - `product.json` : Renommage de marque vers Codeen.
- **Workbench & Services (`src/vs/workbench/contrib/void/browser/`)** :
  - `chatThreadService.ts` : Extension de l'orchestration conversationnelle et branchement des outils/budgets (+299 lignes).
  - `convertToLLMMessageService.ts` : Injection de mémoire et règles contextuelles.
  - `toolsService.ts` : Enrichissement de la collection d'outils agentiques (+283 lignes).
  - `void.contribution.ts` : Enregistrement de nouveaux services singleton.
  - `voidCommandBarService.ts`, `sidebarActions.ts`, `sidebarPane.ts`, `quickEditActions.ts`, `fileService.ts`, `terminalToolService.ts`, `voidSCMService.ts`, `voidSettingsPane.ts`, `voidUpdateActions.ts`.
- **UI React (`browser/react/src/`)** :
  - `sidebar-tsx/SidebarChat.tsx` : Refonte majeure avec intégration de panneaux auxiliaires (TaskProgress, SystemDocsPanel, VoiceInput, ImageUpload, TerminalPanel) (+1 065 lignes).
  - `void-onboarding/VoidOnboarding.tsx` : Onboarding adapté.
  - `void-settings-tsx/Settings.tsx` : Configuration étendue.
  - `util/services.tsx`, `styles.css`.
- **Types et Couche Commune (`common/`)** :
  - `chatThreadServiceTypes.ts`, `toolsServiceTypes.ts`, `voidSettingsTypes.ts`, `modelCapabilities.ts`, `prompts.ts`, `metricsService.ts`.
- **Processus Principal (`electron-main/`)** :
  - `sendLLMMessage.impl.ts`, `sendLLMMessage.ts`.

### 2.2 Fichiers et Dossiers Non Suivis (`untracked`) (32 éléments)
- **Services et Utilitaires Métier en cours de stabilisation** :
  - `browser/voidMemoryService.ts` & `common/voidMemoryService.ts` / `voidMemoryServiceTypes.ts` (Mémoire persistante).
  - `browser/voidBudgetService.ts` & `common/voidBudgetService.ts` / `voidBudgetServiceTypes.ts` (Gestion budgétaire & quotas).
  - `browser/smartContextService.ts` (Analyse intelligente de contexte).
  - `browser/modelRouterService.ts` (Routage dynamique des modèles).
  - `browser/skillService.ts` & `common/skillServiceTypes.ts` (Système de skills agentiques).
  - `browser/systemDocsService.ts` & `common/systemDocsServiceTypes.ts` (Documentation système interne).
  - `browser/workflowService.ts` (Exécution de workflows).
  - `browser/contextBudgetService.ts` & `common/contextBudgetServiceTypes.ts`.
  - `common/securityUtils.ts` (Classification sécuritaire des commandes terminal).
- **Composants UI React Dédiés** :
  - `browser/react/src/sidebar-tsx/TaskProgress.tsx`
  - `browser/react/src/sidebar-tsx/SystemDocsPanel.tsx`
  - `browser/react/src/sidebar-tsx/TerminalPanel.tsx`
  - `browser/react/src/sidebar-tsx/VoiceInput.tsx`
  - `browser/react/src/sidebar-tsx/ImageUpload.tsx`
  - `browser/react/src/util/CodeenLogo.tsx`
- **Plans et Feuilles de Route Existants** :
  - `CODEEN_ANTIGRAVITY_INSPIRED_IMPLEMENTATION_PLAN.md`
  - `IDE_FINAL.md`
  - `task.md` (Suivi des phases 1 à 5 du chantier agentique)
  - `VOID_ARCHITECTURE_HANDOVER.md`
  - `VOID_CONTEXT_AND_COST_OPTIMIZATION_PLAN.md`
  - `VOID_FEATURES_IMPLEMENTATION_PLAN.md`
  - `VOID_HANDOVER.md`
  - `VOID_IMPLEMENTATION_AUDIT_AND_ROADMAP.md`

---

## 3. Évaluation Globale

Le projet Codeen dispose d'une vision agentique très avancée et de développements conceptuels de premier plan (notamment la mémoire persistante, la sécurité des commandes terminal et la régulation budgétaire).

Cependant, il se trouve à un carrefour critique :
1. Le code doit être stabilisé, audité et ordonnancé par spécifications sans perte de données.
2. Le socle VS Code amont (1.99.3) accuse un retard significatif par rapport aux standards actuels du marché (1.121+).
3. L'infrastructure de build, de test et de release automatisée fait actuellement défaut.
