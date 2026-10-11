# Tâches d'Intégration du Design System Stitch dans Codeen

## Jalon 1 : Audit & Formalisation Specify (Terminé)
- [x] **TASK-01** : Audit exhaustif du dossier de design `stitch_codeen_ide_design_system` et extraction des tokens `Obsidian Precision`.
- [x] **TASK-02** : Cartographie matricielle Design Stitch → Master Inventory (`specs/002-codeen-uiux-inventory/spec.md`) → Codebase Codeen.
- [x] **TASK-03** : Rédaction des spécifications et du plan technique dans `specs/003-codeen-stitch-design-system-integration/`.

---

## Jalon 2 : Infrastructure des Tokens & Variables CSS (Terminé)
- [x] **TASK-04** : Définir les variables CSS Obsidian Precision (`--codeen-*`) et la typographie Outfit / JetBrains Mono dans `styles.css`.
- [x] **TASK-05** : Configurer Tailwind CSS (`tailwind.config.js`) pour supporter les classes sémantiques `surface-base`, `surface-panel`, `primary`, `agent-cyan`, `agent-indigo`.
- [x] **TASK-06** : Valider la compilation `npm run buildreact` avec les nouveaux tokens.

---

## Jalon 3 : Refonte Visuelle de l'Onboarding (SCR-01 à SCR-04) (Terminé)
- [x] **TASK-07** : Intégrer l'étape 1 (Welcome) avec le mot-symbole `code/een IDE`, le titre "Beyond Code Completion" et les 3 cartes piliers dans `VoidOnboarding.tsx`.
- [x] **TASK-08** : Intégrer l'étape 2 (Providers) avec la sélection graphique Cloud BYOK / Local vLLM/Ollama dans `VoidOnboarding.tsx`.
- [x] **TASK-09** : Intégrer l'étape 3 (Themes) avec les cartes de prévisualisation interactives dans `VoidOnboarding.tsx`.
- [x] **TASK-10** : Intégrer l'étape 4 (Migration) avec l'import en 1-clic des réglages dans `VoidOnboarding.tsx`.
- [x] **TASK-11** : Vérifier le parcours complet d'Onboarding et la persistance des réglages.

---

## Jalon 4 : Rénovation de la Page d'Accueil de l'Éditeur Vide (SCR-05) (Terminé)
- [x] **TASK-12** : Implémenter le grand mot-symbole Codeen haute fidélité dans `EmptyEditorHome.tsx`.
- [x] **TASK-13** : Styliser la grille d'actions rapides (Open Folder, Clone Repo) et de capacités AI.
- [x] **TASK-14** : Valider la liaison avec les commandes réelles VS Code et l'absence d'erreurs d'exécution.

---

## Jalon 5 : Modernisation de l'Agent Chat & Fast Apply (SCR-06, SCR-07, SCR-08, SCR-14) (Terminé)
- [x] **TASK-15** : Styliser l'en-tête du Chat et le sélecteur de modèle dans `SidebarChat.tsx`.
- [x] **TASK-16** : Rénover l'affichage des messages utilisateurs et des badges de fichiers référencés.
- [x] **TASK-17** : Implémenter l'accordéon **Thinking Process** avec puce animée cyan.
- [x] **TASK-18** : Styliser les cartes d'outils (`read_file`, `edit_file`, `terminal`) avec leurs bandes sémantiques.
- [x] **TASK-19** : Rénover la barre flottante Fast Apply dans `VoidCommandBar.tsx` avec les boutons Accept/Reject jumeaux.
- [x] **TASK-20** : Mettre à niveau le sélecteur d'historique de sessions `SidebarThreadSelector.tsx`.

---

## Jalon 6 : Widgets Monaco d'Édition Rapide (SCR-12, SCR-13)
- [x] **TASK-21** : Styliser le popover flottant de sélection `VoidSelectionHelper.tsx` (`Ctrl+L` / `Ctrl+K`).
- [x] **TASK-22** : Moderniser l'apparence du ZoneWidget Quick Edit `QuickEditChat.tsx` avec lueur diffuse et sélecteur de modèle.

---

## Jalon 7 : Settings Hub & Télémétrie des Tokens (SCR-09, SCR-11)
- [x] **TASK-23** : Réorganiser `Settings.tsx` en layout 2 colonnes avec sous-systèmes naviguables.
- [x] **TASK-24** : Styliser la modal de télémétrie des tokens `TokenUsageDialog.tsx` avec cartes KPI.

---

## Jalon 8 : Validation Globale & Recette
- [x] **TASK-25** : Exécuter `npm run buildreact` et corriger toute régression de style ou de build.
- [x] **TASK-26** : Vérification manuelle et rapport final.
