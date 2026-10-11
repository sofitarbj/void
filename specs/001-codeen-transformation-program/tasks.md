# Tâches d'Exécution : Programme de Transformation Codeen

## Phase 1 : Audit, Hygiène & Nettoyage du Codebase (P0)
- [x] 1.1 Comparer le dossier doublon `src/vs/workbench/contrib/void/browser/react/src2/` avec `src/` pour identifier d'éventuels fichiers uniques
- [x] 1.2 Rapatrier dans `src/` tout composant ou amélioration présent dans `src2/` qui ne s'y trouve pas encore
- [x] 1.3 Supprimer le dossier fantôme `src2/` pour assainir l'arborescence
- [x] 1.4 Vérifier que `npm run buildreact` compile proprement sans erreur

## Phase 2 : Socle de Tokenisation, Tracking & Métriques de Coûts (P0)
- [x] 2.1 Créer `src/vs/workbench/contrib/void/common/tokenizer.ts` (estimation rapide BPE et fallback synchrone)
- [x] 2.2 Créer `src/vs/workbench/contrib/void/common/tokenUsageService.ts` (`ITokenUsageService`, calcul des coûts par million de tokens, stockage journalier)
- [x] 2.3 Enregistrer `ITokenUsageService` dans `void.contribution.ts`
- [x] 2.4 Créer la contribution barre d'état `src/vs/workbench/contrib/void/browser/tokenUsageStatusBar.ts`
- [x] 2.5 Créer le composant React `src/vs/workbench/contrib/void/browser/react/src/void-token-usage-tsx/TokenUsageDialog.tsx`
- [x] 2.6 Connecter l'enregistrement de consommation dans `chatThreadService.ts` à la fin de chaque réponse d'agent
- [x] 2.7 Connecter le calcul avec `IVoidBudgetService` pour la régulation préventive des quotas

## Phase 3 : Points de Restauration Agent (Checkpoints & Rollbacks) (P0)
- [x] 3.1 Ajouter le type `CheckpointEntry` dans `common/chatThreadServiceTypes.ts`
- [x] 3.2 Implémenter la capture de snapshot de fichiers dans `chatThreadService.ts` avant et après exécution d'un tool d'édition
- [x] 3.3 Implémenter la méthode de rollback (`revertToMessageCheckpoint`) dans `chatThreadService.ts`
- [x] 3.4 Ajouter l'élément UI `Checkpoint` avec bouton "Rollback" dans `SidebarChat.tsx`

## Phase 4 : Page d'Accueil & Raccourcis (Empty Editor Home) (P1)
- [x] 4.1 Créer le composant React `src/vs/workbench/contrib/void/browser/react/src/empty-editor-home-tsx/EmptyEditorHome.tsx` avec branding Codeen
- [x] 4.2 Créer le point de montage `index.tsx` dans `empty-editor-home-tsx/`
- [x] 4.3 Intégrer le montage dans `src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts`
- [x] 4.4 Résoudre dynamiquement les raccourcis configurés (Chat, Quick Edit, Terminal, Fichiers) via `IKeybindingService`

## Phase 5 : Consolidation de la Mémoire Persistante & Bootstrap (P0)
- [x] 5.1 Créer `src/vs/workbench/contrib/void/browser/projectMemoryBootstrapContrib.ts`
- [x] 5.2 Déclencher un scan autonome en arrière-plan lors de l'ouverture d'un nouveau projet pour amorcer la mémoire
- [x] 5.3 Enregistrer le résumé et les Knowledge Items dans `IVoidMemoryService`

## Phase 6 : Garde-fous Budgétaires & Sécurité Terminal (P0)
- [x] 6.1 Consolider `common/securityUtils.ts` (classification safe / moderate / destructive)
- [x] 6.2 Vérifier le blocage automatique dans `toolsService.ts` (`run_command` et `run_persistent_command`)
- [x] 6.3 Exposer l'état du budget et les alertes dans la sidebar React (`SidebarChat.tsx`)

## Phase 7 : Outils Agentiques & Todo System Avancé (P1)
- [x] 7.1 Intégrer `todo_write` et le type `TodoItem` dans `toolsServiceTypes.ts` et `toolsService.ts`
- [x] 7.2 Stabiliser `write_to_file` pour la création atomique de nouveaux fichiers
- [x] 7.3 Stabiliser `send_command_input` pour les terminaux interactifs persistants

## Phase 8 : Intégration Voice Locale (Zero-Cloud) (P2)
- [x] 8.1 Concevoir le chargeur sécurisé `transformersRuntime.ts` pour ONNX Web / Transformers
- [x] 8.2 Créer `localVoiceModelService.ts` pour l'inférence audio locale
- [x] 8.3 Intégrer le bouton micro dans `SidebarChat.tsx` sans dépendre d'une clé API externe

## Phase 9 : Support Matériel & Accélérations Locales (P2)
- [x] 9.1 Créer les contrats de service pour MLX et Apple Foundation Models dans `common/`
- [x] 9.2 Créer les connecteurs de transport dans `electron-main/`

## Phase 10 : MCP (Model Context Protocol) (P1)
- [x] 10.1 Valider le chargement du fichier de configuration `mcp.json`
- [x] 10.2 Vérifier la découverte dynamique et l'appel des outils MCP dans `toolsService.ts`

## Phase 11 : Infrastructure CI/CD, Packaging & Multi-Plateforme (P1)
- [x] 11.1 Créer le workflow GitHub Actions Windows (`ci-build-windows.yml`)
- [x] 11.2 Créer le workflow GitHub Actions Linux (`ci-build-linux.yml` générant deb et rpm)
- [x] 11.3 Créer le workflow GitHub Actions macOS (`ci-build-macos.yml`)

## Phase 12 : Préparation de la Migration du Socle VS Code (P1)
- [x] 12.1 Isoler tous les points d'ancrage de la couche IA dans un manifest d'intégration
- [x] 12.2 Élaborer la procédure de rebase vers le tag VS Code 1.121+

## Phase 13 : Validation Finale & Recette (P0)
- [x] 13.1 Vérification de la compilation TypeScript (`npm run compile`)
- [x] 13.2 Compilation de l'interface React (`npm run buildreact`)
- [x] 13.3 Vérification des couches architecturales (`npm run valid-layers-check`)
- [x] 13.4 Lancement et recette fonctionnelle dans Electron (résolution écran noir et validation modules)
