# Plan d'Implémentation Séquentiel : Transformation Haute Fidélité Stitch

## Approche et Principes Directeurs
- **Progression par binômes d'écrans** pour assurer une validation visuelle et fonctionnelle rigoureuse étape par étape.
- **Zéro régression métier** : Chaque composant converti à partir du HTML/CSS Stitch reste 100% raccordé aux services réels existants (`voidSettingsService`, `chatThreadService`, `editCodeService`, etc.).
- **Compilation systématique** : `npm run buildreact` après chaque modification et vérification de non-régression.

---

## Phase 1 : Binôme Onboarding 1 & 2 (SCR-01 & SCR-02)
- **Objectif :** Remplacer intégralement l'accueil et le configurateur d'intelligence artificielle par les composants conformes aux maquettes `scr_01_onboarding_welcome` et `scr_02_onboarding_providers`.
- **Fichiers cibles :**
  - `src/vs/workbench/contrib/void/browser/react/src/void-onboarding/VoidOnboarding.tsx`
  - `src/vs/workbench/contrib/void/browser/react/src/util/CodeenWordmark.tsx`
  - `src/vs/workbench/contrib/void/browser/react/src/util/CodeenLogo.tsx`
- **Validation :**
  - Écran 1 : Affichage du logo `code/een IDE`, hero title "Beyond Code Completion", 3 cartes piliers (Agentic, Sovereign, Inline), footer client-side, bouton "Get Started" menant à l'étape 2.
  - Écran 2 : Stepper actif 02 AI ENGINE, panneau 2 colonnes (Catégories à gauche : Free & Community, Commercial Cloud, Local & Offline ; formulaire dynamique à droite avec sélection des modèles et saisie des clés API persistées dans `voidSettingsService`).

---

## Phase 2 : Binôme Onboarding 3 & 4 (SCR-03 & SCR-04)
- **Objectif :** Remplacer le sélecteur de thème et la migration par les composants conformes à `scr_03_onboarding_theme_picker` et `scr_04_onboarding_settings_import`.
- **Fichiers cibles :**
  - `src/vs/workbench/contrib/void/browser/react/src/void-onboarding/VoidOnboarding.tsx`
- **Validation :**
  - Écran 3 : Cartes interactives des thèmes (Obsidian Emerald, Cyber Cyan, Classic Dark, Light Precision) appliquant immédiatement le thème via `IWorkbenchThemeService`.
  - Écran 4 : Détection automatique des configurations locales et cartes d'import en 1-clic pour VS Code, Cursor et Windsurf. Bouton final "Launch Codeen" activant l'IDE.

---

## Phase 3 : Binôme Workspace (SCR-05 Empty Editor Home & Shell)
- **Objectif :** Conformer la page d'accueil de l'éditeur vide à `scr_05_empty_editor_home`.
- **Fichiers cibles :**
  - `src/vs/workbench/contrib/void/browser/react/src/empty-editor-home-tsx/EmptyEditorHome.tsx`
  - `src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts`
  - `src/vs/workbench/browser/parts/editor/media/editorgroupview.css`
- **Validation :**
  - Mot-symbole géant, grille 2 colonnes (Quick Actions + Capabilities AI), raccourcis clavier natifs affichés et cliquables.

---

## Phase 4 : Binôme Agent Chat & Fast Apply (SCR-06/07/14 & SCR-08)
- **Objectif :** Aligner le Chat dans l'Auxiliary Bar sur `scr_06_07_14_active_agent_fast_apply` et l'historique sur `scr_08_chat_thread_selector_history`.
- **Fichiers cibles :**
  - `src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarChat.tsx`
  - `src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarThreadSelector.tsx`
  - `src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidCommandBar.tsx`
- **Validation :**
  - En-tête chat, Thinking process collapsible, cartes de tool calls avec bordures sémantiques, barre flottante Fast Apply avec boutons Accept/Reject jumeaux.

---

## Phase 5 : Binôme Monaco Widgets (SCR-12 Selection Helper & SCR-13 Quick Edit)
- **Objectif :** Conformer les widgets flottants et de zone Monaco à `scr_12_13_quick_edit_ctrl_k_selection_helper`.
- **Fichiers cibles :**
  - `src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidSelectionHelper.tsx`
  - `src/vs/workbench/contrib/void/browser/react/src/quick-edit-tsx/QuickEditChat.tsx`
- **Validation :**
  - Popover de sélection compact et ZoneWidget Ctrl+K avec lueur diffuse néon et sélecteur de modèle.

---

## Phase 6 : Binôme Configuration (SCR-09 Settings Hub & SCR-11 Token Dashboard)
- **Objectif :** Conformer le hub des réglages à `scr_09_codeen_settings_hub` et le dashboard des tokens à `scr_11_token_cost_dashboard`.
- **Fichiers cibles :**
  - `src/vs/workbench/contrib/void/browser/react/src/void-settings-tsx/Settings.tsx`
  - `src/vs/workbench/contrib/void/browser/react/src/void-token-usage-tsx/TokenUsageDialog.tsx`
- **Validation :**
  - Navigation par sous-systèmes dans Settings et tableau de bord télémétrique des tokens branché sur `ITokenUsageService`.
