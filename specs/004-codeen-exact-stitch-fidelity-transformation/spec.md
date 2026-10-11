# Spécification Technique : Transformation Haute Fidélité 1:1 Stitch dans Codeen

## 1. Vision et Objectif Fondamental

Transformer Codeen IDE pour qu'il incarne **exactement, au pixel, à l'icône et au composant près**, les maquettes et le code HTML/CSS/Tailwind générés dans le dossier `stitch_codeen_ide_design_system/`.

Contrairement aux adaptations superficielles précédentes, chaque écran doit faire l'objet d'un remplacement structurel profond des vues :
- **Conversion 1:1 du HTML/Tailwind en TSX React natif.**
- **Préservation intégrale des services et de la logique métier sous-jacente** (sans données mockées, sans régression des providers, du streaming, des threads, de Monaco ou des commandes VS Code).
- **Suppression définitive des styles et boutons résiduels** de l'ancien fork pour adopter l'esthétique pure **Obsidian Precision**.

---

## 2. Inventaire Exhaustif des Écrans et Fichiers Cibles

| Réf. Écran | Dossier Stitch | Capture de Référence | Source HTML/CSS | Réf. Master Inventory | Composant & Fichiers Codeen Cibles |
|---|---|---|---|---|---|
| **SCR-01** | `scr_01_onboarding_welcome` | `screen.png` (222 Ko) | `code.html` (15,5 Ko) | **SCR-01** (Onboarding Step 1) | `.../void-onboarding/VoidOnboarding.tsx`<br>`.../util/CodeenWordmark.tsx`<br>`.../util/CodeenLogo.tsx` |
| **SCR-02** | `scr_02_onboarding_providers` | `screen.png` (325 Ko) | `code.html` (25,1 Ko) | **SCR-02** (Onboarding Step 2) | `.../void-onboarding/VoidOnboarding.tsx`<br>`.../void-settings-tsx/Settings.tsx` |
| **SCR-03** | `scr_03_onboarding_theme_picker` | `screen.png` (243 Ko) | `code.html` (23,8 Ko) | **SCR-03** (Onboarding Step 3) | `.../void-onboarding/VoidOnboarding.tsx`<br>`IWorkbenchThemeService` |
| **SCR-04** | `scr_04_onboarding_settings_import` | `screen.png` (221 Ko) | `code.html` (20,2 Ko) | **SCR-04** (Onboarding Step 4) | `.../void-onboarding/VoidOnboarding.tsx`<br>`extensionTransferService.ts` |
| **SCR-05** | `scr_05_empty_editor_home` | `screen.png` (427 Ko) | `code.html` (40,4 Ko) | **SCR-05** (Empty Editor Home) | `.../empty-editor-home-tsx/EmptyEditorHome.tsx`<br>`editorGroupWatermark.ts`<br>`editorgroupview.css` |
| **SCR-06/07/14** | `scr_06_07_14_active_agent_fast_apply` | `screen.png` (480 Ko) | `code.html` (46,9 Ko) | **SCR-06** (Chat Header)<br>**SCR-07** (Conversation & Tools)<br>**SCR-14** (Fast Apply) | `.../sidebar-tsx/SidebarChat.tsx`<br>`.../sidebar-tsx/VoidChatArea.tsx`<br>`.../void-editor-widgets-tsx/VoidCommandBar.tsx` |
| **SCR-08** | `scr_08_chat_thread_selector_history` | `screen.png` (395 Ko) | `code.html` (38,9 Ko) | **SCR-08** (Sessions & History) | `.../sidebar-tsx/SidebarThreadSelector.tsx`<br>`chatThreadService.ts` |
| **SCR-09** | `scr_09_codeen_settings_hub` | `screen.png` (438 Ko) | `code.html` (38,1 Ko) | **SCR-09** (Settings Hub) | `.../void-settings-tsx/Settings.tsx`<br>`voidSettingsPane.ts` |
| **SCR-11** | `scr_11_token_cost_dashboard` | `screen.png` (343 Ko) | `code.html` (32,4 Ko) | **SCR-11** (Token Telemetry) | `.../void-token-usage-tsx/TokenUsageDialog.tsx`<br>`tokenUsageStatusBar.ts` |
| **SCR-12/13** | `scr_12_13_quick_edit_ctrl_k_selection_helper` | `screen.png` (377 Ko) | `code.html` (32,0 Ko) | **SCR-12** (Selection Popover)<br>**SCR-13** (Inline ZoneWidget) | `.../void-editor-widgets-tsx/VoidSelectionHelper.tsx`<br>`.../quick-edit-tsx/QuickEditChat.tsx` |

---

## 3. Méthodologie d'Implémentation par Paires d'Écrans

1. **Parcours Séquentiel par Binômes :**
   - **Binôme 1 :** Onboarding SCR-01 (Welcome) + SCR-02 (Providers Engine)
   - **Binôme 2 :** Onboarding SCR-03 (Theme Picker) + SCR-04 (Migration / Import)
   - **Binôme 3 :** Workspace SCR-05 (Empty Editor Home) + Shell Navigation
   - **Binôme 4 :** AI Core SCR-06/07/14 (Sidebar Chat, Thinking, Tool Cards, Fast Apply Diff) + SCR-08 (Thread History)
   - **Binôme 5 :** Monaco Inline SCR-12 (Selection Helper) + SCR-13 (Quick Edit Ctrl+K Zone)
   - **Binôme 6 :** Configuration SCR-09 (Settings Hub) + SCR-11 (Token Dashboard)

2. **Règles Strictes de Traduction :**
   - Ne pas conserver de styles ou boutons résiduels VS Code/Void là où la maquette impose une structure dédiée.
   - Les icônes (`Material Symbols` / `Lucide`) doivent respecter fidèlement la maquette.
   - Les liaisons aux `services` réels (changement de fournisseur, streaming LLM, sauvegarde de clé, sélection de thème) sont branchées directement dans les nouveaux composants.
   - Chaque binôme est compilé, testé et validé visuellement avant de passer au suivant.
