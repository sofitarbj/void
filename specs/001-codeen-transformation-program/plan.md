# Plan d'Architecture & d'Implémentation : Transformation Codeen

## 1. Stratégie d'Exécution en 13 Phases

Ce plan détaille la séquence logique et ordonnée pour transformer Codeen en un IDE IA mature et complet.

```text
Phase 1 : Audit, Hygiène & Nettoyage (Assainissement immédiat)
    ↓
Phase 2 : Socle de Tokenisation, Tracking & Métriques de Coûts
    ↓
Phase 3 : Points de Restauration Agent (Checkpoints & Rollbacks)
    ↓
Phase 4 : Page d'Accueil & Raccourcis (Empty Editor Home)
    ↓
Phase 5 : Consolidation de la Mémoire Persistante & Bootstrap de Workspace
    ↓
Phase 6 : Garde-fous Budgétaires & Sécurité Terminal (Consolidation Codeen)
    ↓
Phase 7 : Outils Agentiques & Todo System Avancé
    ↓
Phase 8 : Intégration Voice Locale & Runtimes Transformers
    ↓
Phase 9 : Support Matériel & Accélérations Locales (Apple MLX / Foundation)
    ↓
Phase 10 : MCP & Protocoles Contextuels
    ↓
Phase 11 : Infrastructure CI/CD, Packaging & Multi-Plateforme
    ↓
Phase 12 : Préparation de la Migration du Socle VS Code (vers 1.121+)
    ↓
Phase 13 : Validation Complète, Smoke Tests & Recette Finale
```

---

## 2. Détail Technique des Premières Phases Clés

### Phase 1 : Audit, Hygiène & Nettoyage du Codebase
- **Objectif :** Éliminer la confusion architecturale et les artefacts orphelins avant d'écrire le nouveau code.
- **Actions :**
  1. Comparer les 44 fichiers du dossier dupliqué `src/vs/workbench/contrib/void/browser/react/src2/` avec `src/`.
  2. Vérifier qu'aucun composant unique n'est perdu (ex: `TaskProgress.tsx`, `CodeenLogo.tsx`, `VoiceInput.tsx` déjà présents ou à rapatrier dans `src/`).
  3. Supprimer le dossier fantôme `src2/` pour restaurer la clarté du compilateur.
  4. Valider le build React (`npm run buildreact`).

### Phase 2 : Tokenisation, Tracking & Métriques de Coûts
- **Architecture :**
  - Service commun : `ITokenUsageService` dans `src/vs/workbench/contrib/void/common/tokenUsageService.ts`.
  - Tokenizer hors-ligne : `tokenizer.ts` (estimation rapide BPE / fallback caractère).
  - Contribution workbench : `TokenUsageStatusBarService` dans `browser/tokenUsageStatusBar.ts`.
  - Composant UI React : `TokenUsageDialog.tsx` dans `browser/react/src/void-token-usage-tsx/`.
  - Connexion avec `IVoidBudgetService` pour que chaque appel LLM décrémente le budget tout en incrémentant l'historique de consommation.

### Phase 3 : Checkpoints & File Rollbacks
- **Architecture :**
  - Extension des types dans `chatThreadServiceTypes.ts` avec `CheckpointEntry`.
  - Capture de snapshot dans `chatThreadService.ts` via `IVoidModelService` avant exécution de tools d'édition.
  - Fonction de restauration atomique des fichiers lors du clic "Rollback" dans `SidebarChat.tsx`.

### Phase 4 : Écran d'Accueil Empty Editor
- **Architecture :**
  - Composant React `EmptyEditorHome.tsx` dans `browser/react/src/empty-editor-home-tsx/`.
  - Raccordement dans `src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts`.
  - Résolution dynamique des raccourcis via `IKeybindingService`.

### Phase 5 : Mémoire Persistante & Bootstrap Automatique
- **Architecture :**
  - Création de `projectMemoryBootstrapContrib.ts` déclenché au premier chargement d'un workspace.
  - Connexion avec `IVoidMemoryService` existant dans Codeen pour stocker les résumés et Knowledge Items.

---

## 3. Gestion des Risques & Mitigations

| Risque | Impact | Stratégie d'Atténuation |
| :--- | :--- | :--- |
| **Régression de compilation TypeScript** | Élevé | Compiler régulièrement avec `npm run compile` et vérifier l'absence d'erreurs cycliques. |
| **Conflit de licences / copie directe** | Critique | Rédaction de code TypeScript originale selon l'approche clean-room documentée dans l'audit de provenance. |
| **Instabilité du process Electron** | Moyen | Isoler les runtimes natifs ou WebAssembly (Transformers/ONNX) avec fallbacks sécurisés. |
