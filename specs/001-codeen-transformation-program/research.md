# Recherche & Matrice de Comparaison : Codeen vs Loophole

## 1. Contexte et Objectifs

Ce document établit la cartographie exhaustive et comparative entre **Codeen** (projet cible, `e:\dev\void`) et **Loophole** (projet de référence, `e:\dev\loophole\loophole`).
L'objectif est d'identifier chaque capacité technique, fonctionnelle et industrielle conférant son avance actuelle à Loophole, afin de la réimplémenter de manière propre et native dans Codeen, tout en valorisant les avancées spécifiques de Codeen (mémoire persistante KI, limitation budgétaire préventive, classification de sécurité des commandes terminal).

---

## 2. Synthèse Plateforme & Runtimes

| Composant | Codeen (`e:\dev\void`) | Loophole (`e:\dev\loophole\loophole`) | Écart Technique | Impact pour Codeen |
| :--- | :--- | :--- | :--- | :--- |
| **VS Code Base** | `1.99.3` | `1.121.0` | +22 versions mineures | Absence des dernières APIs Monaco, agentHost, terminal & accessibilité |
| **Electron** | `34.3.2` | `39.8.8` | +5 versions majeures | Performances V8, gestion mémoire, WebGPU, ESM loaders |
| **Node Target** | Node 20.x | Node 24.18.0 | Version LTS supérieure | APIs crypto, streams et fetch natives plus rapides |
| **Packaging Multi-OS** | Aucun script de release | Windows Setup, macOS DMG, Linux deb/rpm | Industrialisation absente dans Codeen | Nécessite la création complète de la chaîne de release |

---

## 3. Matrice de Comparaison Domaine par Domaine

| Domaine | Fonctionnalité Loophole | État Codeen | Différence | Action Codeen | Fichiers Codeen concernés | Priorité | État |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Socle Core** | VS Code 1.121.0 + Electron 39 | VS Code 1.99.3 + Electron 34 | Socle ancien, mais fonctionnel localement | Préparer le rebase modulaire de la couche IA | `package.json`, `build/` | P1 | Planifié |
| **Token Tracking** | `ITokenUsageService` + `gpt-tokenizer` + `TokenUsageStatusBar` + `TokenUsageDialog` | Pas de tokenizer local ; calcul de coût partiel dans `voidBudgetService` | Loophole offre un tableau de bord graphique complet + heatmap annuelle | Réimplémenter `ITokenUsageService` et dialogue de visualisation, connecté à `IVoidBudgetService` | `src/vs/workbench/contrib/void/common/tokenUsageService.ts`, `browser/tokenUsageStatusBar.ts`, `browser/react/src/void-token-usage-tsx/` | P0 | En cours |
| **Agent Checkpoints** | `CheckpointEntry` (snapshots de fichiers avant/après éditions d'outils) | Non implémenté (uniquement undo manuel) | Loophole permet le rollback précis d'une intervention agent depuis la timeline | Réimplémenter la capture de snapshot et la fonction de rollback de message dans `chatThreadService` | `common/chatThreadServiceTypes.ts`, `browser/chatThreadService.ts`, `browser/react/src/sidebar-tsx/SidebarChat.tsx` | P0 | Planifié |
| **Empty Editor Home** | `EmptyEditorHome.tsx` monté dans `editorGroupWatermark.ts` avec raccourcis dynamiques | Écran watermark standard VS Code | Expérience d'accueil vide, manque de raccourcis IA | Réimplémenter la vue d'accueil React Codeen dans `editorGroupWatermark.ts` avec branding Codeen | `browser/react/src/empty-editor-home-tsx/`, `browser/parts/editor/editorGroupWatermark.ts` | P1 | Planifié |
| **Voice Dictation** | Runtime Transformers.js / ONNX local sans cloud (`transformersRuntime.ts`) | Prototype partiel `VoiceInput.tsx` dans `SidebarChat` | Loophole a un runtime local autonome sans clé API externe | Réimplémenter le chargeur ONNX/Transformers local pour la transcription vocale | `browser/transformersRuntime.ts`, `browser/localVoiceModelService.ts`, `browser/react/src/sidebar-tsx/VoiceInput.tsx` | P2 | Planifié |
| **Hardware Accel.** | Support MLX et Apple Foundation Models | Uniquement providers API distants + Ollama | Loophole tire parti des puces Apple Silicon en local | Réimplémenter les passerelles MLX et Apple Foundation Models dans `common/` et `electron-main/` | `common/mlxService.ts`, `common/appleFoundationModelsService.ts`, `electron-main/mlxMainService.ts` | P2 | Planifié |
| **Outils Agent** | 12 outils intégrés (`todo_write`, `run_persistent_command`, etc.) | Outils existants + prototypes non stabilisés (`todo_list`, `ask_user_question`, `write_to_file`) | Codeen a des outils plus riches mais non consolidés | Standardiser et stabiliser les outils agentiques, intégrer `todo_write` typé | `common/toolsServiceTypes.ts`, `browser/toolsService.ts` | P0 | Planifié |
| **Mémoire Persistante** | `projectMemoryBootstrapContrib` + `write_project_memory` | `voidMemoryService` (Knowledge Items + session summary) | Codeen a une architecture KI supérieure, mais manque de bootstrap automatique au premier lancement | Fusionner l'auto-bootstrap de workspace dans `voidMemoryService` | `browser/projectMemoryBootstrapContrib.ts`, `browser/voidMemoryService.ts` | P0 | Planifié |
| **MCP** | `mcpService.ts` opérationnel | `mcpService.ts` identique, configuration présente | Parité existante | Valider l'exécution et l'activation des serveurs MCP dans l'UI | `common/mcpService.ts`, `browser/react/src/void-settings-tsx/Settings.tsx` | P1 | Conforme |
| **Sécurité & Quotas** | Aucune classification de commandes terminal ni blocage budgétaire | `securityUtils.ts` + `voidBudgetService.ts` | **Codeen est supérieur** sur la sécurité terminal et le plafonnement budgétaire | Conserver, tester et exposer dans l'UI React | `common/securityUtils.ts`, `browser/voidBudgetService.ts`, `browser/react/src/sidebar-tsx/` | P0 | Codeen Avancé |
| **CI/CD & Packaging** | 23 workflows GitHub Actions (Win x64, macOS, Linux deb/rpm, auto-updater) | 1 seul workflow (`triage.yml`) | Retard majeur d'industrialisation | Réimplémenter les workflows de build GitHub Actions pour Codeen | `.github/workflows/ci-build-windows.yml`, `.github/workflows/ci-build-linux.yml` | P1 | Planifié |
| **Hygiène du Code** | Dépôt propre, versionné | Dossier doublon `src2/` (44 fichiers), 31 fichiers modifiés non commités | Codeen souffre de scories de développement | Nettoyer `src2/`, stabiliser et commiter les lots de travail | `browser/react/src2/` | P0 | À exécuter immédiatement |
