# Spécification Fonctionnelle & Technique : Intégration du Design System Stitch dans Codeen

## 1. Contexte & Objectif

Cette spécification définit l'intégration native, cohérente et maintenable du nouveau design system **Obsidian Precision** (issu de `stitch_codeen_ide_design_system`) au sein de l'environnement applicatif de **Codeen IDE** (`e:\dev\void`), un fork de VS Code / Void.

L'objectif est d'incarner fidèlement la nouvelle identité visuelle et ergonomique de Codeen (palette obsidian `#0B0D11` / `#12151B`, accents Radiant Emerald `#00DC82`, Electric Cyan `#00D1FF`, Deep Indigo `#2563FF`, typographie Outfit pour l'interface et JetBrains Mono pour le code, mot-symbole `code/een IDE` avec le second `e` inversé) **sans jamais créer une surcouche web factice**, mais en modifiant et enrichissant l'architecture réelle au bon niveau :
1. **VS Code Theme & Color Registry** (Tokens de surface, bordures et contraste Workbench).
2. **Codeen Shared React Components** (Onboarding, Empty Editor Home, Sidebar Chat, Settings Hub, Token Usage).
3. **Monaco Widgets & Editor Extensions** (Fast Apply Command Bar, Quick Edit ZoneWidget `Ctrl+K`, Selection Popover `Ctrl+L`).
4. **Services Métier & Enclave Locale** (Conserver 100% du binding réel sans données mockées).

---

## 2. Audit Exhaustif du Dossier de Design Stitch

Le répertoire source `stitch_codeen_ide_design_system` comprend 11 dossiers :

| Dossier Design | Contenu | Rôle Visuel |
|---|---|---|
| `obsidian_precision/` | `DESIGN.md` | Spécification formelle des design tokens, élévation, typo, boutons et motion |
| `scr_01_onboarding_welcome/` | `code.html`, `screen.png` | Écran 1 de l'Onboarding : Accueil, proposition de valeur, mot-symbole Codeen, 3 piliers (Agentic, Sovereign, Inline) |
| `scr_02_onboarding_providers/` | `code.html`, `screen.png` | Écran 2 de l'Onboarding : Configuration des fournisseurs LLM (Cloud BYOK vs Local Ollama/vLLM) |
| `scr_03_onboarding_theme_picker/` | `code.html`, `screen.png` | Écran 3 de l'Onboarding : Sélecteur de thèmes avec cartes interactives (Obsidian Emerald, Cyber Cyan, Classic Dark, Light Precision) |
| `scr_04_onboarding_settings_import/` | `code.html`, `screen.png` | Écran 4 de l'Onboarding : Import en 1 clic des réglages, keybindings et extensions VS Code / Cursor / Windsurf |
| `scr_05_empty_editor_home/` | `code.html`, `screen.png` | Écran d'accueil de l'éditeur vide : Logo géant haute fidélité, grille de commandes rapides et capacités d'agents |
| `scr_06_07_14_active_agent_fast_apply/` | `code.html`, `screen.png` | Shell complet avec Auxiliary Bar Chat, Tool Calls en temps réel, Thinking process collapsible, et barre Fast Apply diff dans Monaco |
| `scr_08_chat_thread_selector_history/` | `code.html`, `screen.png` | Panneau déroulant / modal de gestion de l'historique des threads de chat, recherche et métadonnées |
| `scr_09_codeen_settings_hub/` | `code.html`, `screen.png` | Hub des paramètres Codeen pleine page (Fournisseurs, MCP, Accélération matérielle, Voix locale, Télémétrie) |
| `scr_11_token_cost_dashboard/` | `code.html`, `screen.png` | Dashboard modal de suivi télémétrique des tokens, budget, répartition par modèle et session locale |
| `scr_12_13_quick_edit_ctrl_k_selection_helper/` | `code.html`, `screen.png` | Popover flottant de sélection (`Ctrl+L` / `Ctrl+K`) et Monaco ZoneWidget pour l'édition rapide en ligne |

---

## 3. Matrice de Mapping : Stitch → UI/UX Master Inventory → Codebase Codeen

Chaque maquette se rattache précisément au contrat fonctionnel du Master Inventory (`specs/002-codeen-uiux-inventory/spec.md`) et aux fichiers du codebase existant :

| Écran Stitch | Réf. Inventory | Surface Codeen Cible | Fichier Source Codeen Principal | Type Architectural | Stratégie d'Intégration |
|---|---|---|---|---|---|
| `scr_01_onboarding_welcome` | **SCR-01** | `VoidOnboarding` (Step 1) | `.../void-onboarding/VoidOnboarding.tsx` | React Component | Styliser l'étape Welcome avec le mot-symbole `code/een IDE`, hero title et cartes des 3 piliers. Conserver le service `voidOnboardingService.ts`. |
| `scr_02_onboarding_providers` | **SCR-02** | `VoidOnboarding` (Step 2) | `.../void-onboarding/VoidOnboarding.tsx` | React Component | Styliser la grille 2 colonnes (Cloud BYOK vs Local vLLM/Ollama). Relier aux actions réelles `setGlobalSetting`. |
| `scr_03_onboarding_theme_picker` | **SCR-03** | `VoidOnboarding` (Step 3) | `.../void-onboarding/VoidOnboarding.tsx` | React Component | Intégrer les cartes de prévisualisation de thème reliées à `IWorkbenchThemeService.setColorTheme()`. |
| `scr_04_onboarding_settings_import` | **SCR-04** | `VoidOnboarding` (Step 4) | `.../void-onboarding/VoidOnboarding.tsx` | React Component | Remplacer la liste basique par les cartes d'import VS Code / Cursor / Windsurf avec détection des configurations locales. |
| `scr_05_empty_editor_home` | **SCR-05** | `EmptyEditorHome` | `.../empty-editor-home-tsx/EmptyEditorHome.tsx` | React Component monté dans Editor Pane | Intégrer le grand logo `code/een IDE`, la grille Quick Actions (Open Folder, Clone Repo) et Capabilities (Full Agent, Quick Edit `Ctrl+K`) connectés aux commandes réelles de VS Code. |
| `scr_06_07_14_active_agent_fast_apply` (Chat & Agent) | **SCR-06**, **SCR-07** | `SidebarChat` & `VoidChatArea` | `.../sidebar-tsx/SidebarChat.tsx`, `.../sidebar-tsx/VoidChatArea.tsx` | React Component dans Auxiliary Bar | Styliser le fil de discussion, le message utilisateur avec puces `@fichier`, l'accordéon **Thinking Process** avec puce cyan pulsante, et les cartes d'outils (`read_file`, `edit_file`, `terminal`). |
| `scr_06_07_14_active_agent_fast_apply` (Fast Apply) | **SCR-14** | `VoidCommandBar` & Monaco Diff Decoration | `.../void-editor-widgets-tsx/VoidCommandBar.tsx` | Monaco ContentWidget / OverlayWidget | Rénover la barre flottante Fast Apply avec statistiques `+18 -6`, boutons jumeaux "Accept File (`⌘Enter`)" en émeraude et "Reject (`⌘⌫`)" en gris ardoise. |
| `scr_08_chat_thread_selector_history` | **SCR-08** | `SidebarThreadSelector` | `.../sidebar-tsx/SidebarThreadSelector.tsx` | React Popover / Modal | Adopter le style Obsidian Precision avec recherche rapide, statistiques de tokens et groupement chronologique (Aujourd'hui, Hier, 7 derniers jours). |
| `scr_09_codeen_settings_hub` | **SCR-09** | `Settings` | `.../void-settings-tsx/Settings.tsx` | React Component monté via Editor Input | Structurer en 2 colonnes (Navigation sous-systèmes à gauche, panneau de configuration des fournisseurs, MCP et matériels à droite). |
| `scr_11_token_cost_dashboard` | **SCR-11** | `TokenUsageDialog` | `.../void-token-usage-tsx/TokenUsageDialog.tsx` | React Modal | Intégrer le tableau de bord avec KPI cards, jauge de budget locale et historique par modèle, relié au `metricsService`. |
| `scr_12_13_quick_edit_ctrl_k_selection_helper` (Selection Popover) | **SCR-12** | `VoidSelectionHelper` | `.../void-editor-widgets-tsx/VoidSelectionHelper.tsx` | Monaco OverlayWidget | Barre compacte sur sélection avec boutons `Ctrl+L Chat`, `Ctrl+K Edit` et menu More. |
| `scr_12_13_quick_edit_ctrl_k_selection_helper` (Quick Edit Zone) | **SCR-13** | `QuickEditChat` | `.../quick-edit-tsx/QuickEditChat.tsx` | Monaco ZoneWidget | ZoneWidget ancré sous la sélection avec lueur diffuse subtile, sélecteur de modèle compact et champ de saisie prompt. |

---

## 4. Spécification des Design Tokens : Obsidian Precision

### 4.1 Palette de Couleurs Sémantiques

```css
:root {
  /* Surfaces */
  --codeen-surface-base: #0B0D11;              /* Layer 0: Éditeur Monaco et canvas de fond */
  --codeen-surface-panel: #12151B;             /* Layer 1: Barres latérales, terminal, status bar */
  --codeen-surface-elevated: #1A1E26;          /* Layer 2: Cartes d'outils, Fast Apply, Quick Edit */
  --codeen-surface-hover: #222732;             /* Survol interactif */
  --codeen-surface-container-high: #282a2e;    /* Conteneur contrasté */

  /* Bordures */
  --codeen-border-subtle: #242933;             /* Séparateurs structurels 1px */
  --codeen-border-hairline: rgba(255, 255, 255, 0.08); /* Délimitations internes subtiles */
  --codeen-border-active: #00DC82;             /* Bordure de focus actif */

  /* Accents */
  --codeen-primary: #00DC82;                   /* Radiant Emerald: validation, acceptation, boutons clés */
  --codeen-primary-hover: #00F08F;             /* Survol primaire */
  --codeen-primary-container: rgba(0, 220, 130, 0.15); /* Fond badges émeraude */
  --codeen-on-primary: #0B0D11;                /* Texte sur accent émeraude */

  --codeen-agent-cyan: #00D1FF;                /* Electric Cyan: thinking, streaming, télémétrie IA */
  --codeen-agent-cyan-container: rgba(0, 209, 255, 0.12); /* Fond badges cyan */

  --codeen-agent-indigo: #2563FF;              /* Deep Indigo: MCP, processus système asynchrones */
  --codeen-agent-indigo-container: rgba(37, 99, 255, 0.12);

  /* Diff & Statuts */
  --codeen-diff-addition: #10B981;             /* Vert ajout git */
  --codeen-diff-addition-surface: rgba(16, 185, 129, 0.12);
  --codeen-diff-deletion: #EF4444;             /* Rouge suppression git */
  --codeen-diff-deletion-surface: rgba(239, 68, 68, 0.12);

  /* Typographie */
  --codeen-text-primary: #F3F4F6;
  --codeen-text-secondary: #9CA3AF;
  --codeen-text-muted: #6B7280;
}
```

### 4.2 Typographie
- **Outfit** (`font-sans`) : Utilisé pour les titres, boutons, badges sémantiques, étiquettes UI et texte de réflexion des agents.
- **JetBrains Mono** (`font-mono`) : Utilisé pour le code, les arguments d'outils, les touches de raccourcis, les compteurs de tokens et les badges de statut.

### 4.3 Mot-Symbole Codeen (High-Fidelity Wordmark)
Dans les interfaces d'accueil (`VoidOnboarding` et `EmptyEditorHome`), le logo Codeen s'exprime par :
- Racine `code` en Outfit 600 ou 700.
- Slash central `/` en Radiant Emerald (`#00DC82`) avec lueur diffuse (`drop-shadow(0 0 16px rgba(0, 220, 130, 0.45))`).
- Terminaison `een` avec le deuxième `e` inversé à 180° (`inline-block rotate-180 transform -translate-y-[1px] text-primary`).
- Badge optionnel `IDE` en JetBrains Mono uppercase.

---

## 5. Critères d'Acceptation & Non-Régression

1. **Intégrité de l'Onboarding** : L'utilisateur peut parcourir les étapes 1 à 4, configurer son modèle initial, choisir son thème, importer ses préférences et terminer avec persistance dans les réglages globaux (`voidOnboardingService`).
2. **Exécutabilité de la Home** : Chaque bouton de `EmptyEditorHome` déclenche la véritable commande VS Code associée (`workbench.action.files.openFolder`, etc.).
3. **Réactivité de l'Agent Chat** : Les tool calls affichent leur statut réel (`running`, `success`, `error`) avec la couleur associée (Cyan pour lecture, Émeraude pour écriture, Indigo pour MCP/terminal).
4. **Précision du Fast Apply** : La barre flottante permet d'accepter ou rejeter les diffs sans délai, et reflète les lignes réellement ajoutées/supprimées.
5. **Fiabilité de Compilation** : `npm run buildreact` et `npx tsc -p src/tsconfig.monaco.json --noEmit` compilent sans aucune erreur.
