# Tâches Détaillées : Transformation Haute Fidélité Stitch par Binômes d'Écrans

## Phase 1 : Binôme Onboarding 1 & 2 (SCR-01 & SCR-02)
- [ ] **TASK-01** : Convertir exactement le code HTML/Tailwind de `scr_01_onboarding_welcome/code.html` dans `VoidOnboarding.tsx` pour l'étape Welcome :
  - Mot-symbole exact `code/een IDE` avec le second `e` inversé et le slash émeraude.
  - Grand titre `Beyond Code Completion` et sous-titre de mission.
  - 3 cartes piliers avec icônes Material/Lucide (`01 // Agentic`, `02 // Sovereign`, `03 // Inline`) et leurs badges terminaux.
  - Footer de réassurance client-side et boutons "Skip setup" / "Get Started" (action vers l'étape 2).
- [ ] **TASK-02** : Convertir exactement le code HTML/Tailwind de `scr_02_onboarding_providers/code.html` dans `VoidOnboarding.tsx` pour l'étape Providers :
  - Chrome supérieur avec indicateurs d'état et Stepper 4 étapes.
  - Colonne gauche avec les 3 classes de providers (`Free & Community`, `Commercial Cloud`, `Local & Offline`).
  - Colonne droite avec formulaires interactifs branchés directement sur `voidSettingsService` (saisie de clé, sélection de modèles, test de connexion).
  - Boutons de navigation "Back" et "Continue to Theme" (action vers l'étape 3).
- [ ] **TASK-03** : Valider la compilation `npm run buildreact` et tester visuellement les deux premiers écrans d'onboarding.

---

## Phase 2 : Binôme Onboarding 3 & 4 (SCR-03 & SCR-04)
- [ ] **TASK-04** : Convertir exactement le code HTML/Tailwind de `scr_03_onboarding_theme_picker/code.html` dans `VoidOnboarding.tsx` pour l'étape Theme.
- [ ] **TASK-05** : Convertir exactement le code HTML/Tailwind de `scr_04_onboarding_settings_import/code.html` dans `VoidOnboarding.tsx` pour l'étape Migration.
- [ ] **TASK-06** : Valider la compilation `npm run buildreact` et tester le parcours complet d'onboarding.

---

## Phase 3 : Binôme Workspace (SCR-05 Empty Editor Home & Shell)
- [ ] **TASK-07** : Convertir exactement le code HTML/Tailwind de `scr_05_empty_editor_home/code.html` dans `EmptyEditorHome.tsx`.
- [ ] **TASK-08** : Connecter toutes les tuiles d'actions rapides aux commandes natives de VS Code (`openFolder`, `newFile`, `cloneRepo`).
- [ ] **TASK-09** : Valider la compilation et vérifier l'affichage dans l'éditeur vide.

---

## Phase 4 : Binôme Agent Chat & Fast Apply (SCR-06/07/14 & SCR-08)
- [ ] **TASK-10** : Convertir exactement les cartes de chat, thinking process et tool calls de `scr_06_07_14_active_agent_fast_apply/code.html` dans `SidebarChat.tsx`.
- [ ] **TASK-11** : Convertir la barre Fast Apply dans `VoidCommandBar.tsx` avec les boutons Accept/Reject conformes.
- [ ] **TASK-12** : Convertir l'historique des threads de `scr_08_chat_thread_selector_history/code.html` dans `SidebarThreadSelector.tsx`.
- [ ] **TASK-13** : Valider la compilation et le fonctionnement en direct de l'agent.

---

## Phase 5 : Binôme Monaco Widgets (SCR-12 Selection Helper & SCR-13 Quick Edit)
- [ ] **TASK-14** : Convertir le popover flottant de sélection dans `VoidSelectionHelper.tsx` selon `scr_12_13_quick_edit_ctrl_k_selection_helper/code.html`.
- [ ] **TASK-15** : Convertir le ZoneWidget Quick Edit dans `QuickEditChat.tsx` selon `scr_12_13_quick_edit_ctrl_k_selection_helper/code.html`.
- [ ] **TASK-16** : Valider la compilation et le déclenchement via `Ctrl+L` / `Ctrl+K`.

---

## Phase 6 : Binôme Configuration (SCR-09 Settings Hub & SCR-11 Token Dashboard)
- [ ] **TASK-17** : Convertir le hub des réglages dans `Settings.tsx` selon `scr_09_codeen_settings_hub/code.html`.
- [ ] **TASK-18** : Convertir le dashboard télémétrique de tokens dans `TokenUsageDialog.tsx` selon `scr_11_token_cost_dashboard/code.html`.
- [ ] **TASK-19** : Validation finale globale et tests de régression.
