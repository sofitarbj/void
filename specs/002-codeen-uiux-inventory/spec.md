# Spécification & Inventaire Maître UI/UX : Codeen IDE

## 1. Vision et Objectifs de l'Audit

Ce document constitue la **cartographie exhaustive de la surface UI/UX** de Codeen IDE, construite à partir de l'exploration approfondie du socle technique (VS Code 1.99.3 forké, surcouche Void IDE 1.4.9 et enrichissements propres à Codeen).

### 1.1 Objectif Stratégique
Préparer la future refonte de marque et d'expérience de Codeen afin que le développeur ne ressente plus *"un VS Code modifié"* mais une véritable identité native **Codeen**, tout en préservant 100% de la stabilité, des performances et de l'écosystème d'extensions du socle VS Code / Monaco.

### 1.2 Principes Directeurs
1. **Zéro régression sur le moteur d'édition** : Ne jamais briser Monaco, le système de fenêtrage, le système de fichiers ou l'Extension Host.
2. **Surcouche déclarative et cohérente** : Les composants React/DOM de Codeen s'appuient sur les tokens CSS de l'IDE (`--vscode-*` et variables dérivées `--void-*`).
3. **Clarté agentique** : L'expérience IA (Chat, Agent, Gather, Quick Edit, Fast Apply, MCP) est le différenciateur clé et le cœur de l'identité visuelle.

---

## 2. Cartographie des Parcours Utilisateurs Réels

### 2.1 Parcours A — Premier Lancement (First Run & Onboarding)
```text
[Lancement Electron (code.bat)]
           ↓
[Vérification de l'état `isOnboardingComplete`]
   ├── SI `false` → [Overlay Fullscreen VoidOnboarding (z-99999)]
   │                     ├── Page 0: Welcome to Codeen (Logo SVG Codeen, CTA "Get Started")
   │                     ├── Page 1: Add a Provider (Tabs Free/Paid/Local/Cloud, API Keys, Voice Model)
   │                     ├── Page 2: Choose your theme (Aperçu syntaxique 4 thèmes, switch dynamique)
   │                     ├── Page 3: Settings & Editor Import (1-Click Switch: VS Code, Cursor, Windsurf)
   │                     └── Bouton X (Skip immédiat) ou "Enter Codeen" → `isOnboardingComplete: true`
   └── SI `true`  → [Arrivée directe dans le Workspace Principal]
```

### 2.2 Parcours B — Workspace Vide (Empty Editor)
```text
[Aucun fichier ouvert dans l'Editor Group actif]
           ↓
[Montage automatique du composant React `EmptyEditorHome`]
   ├── Logo Codeen haute fidélité (96px, palette primaire cyan/indigo)
   ├── Titre : "Beyond Code Completion" — Sous-titre : "An Agentic AI IDE"
   └── Boîte interactive des raccourcis cliquables (Chat, Quick Edit, Inline Chat, Go to File, Terminal)
```

### 2.3 Parcours C — Session de Travail & Expérience Agentique (AI Core)
```text
[Utilisateur ouvre la barre latérale droite (Auxiliary Bar) ou tape Ctrl+L]
           ↓
[Vue Chat `SidebarChat` initialisée]
   ├── Landing State : Suggestions de prompts, Historique des threads
   ├── Saisie utilisateur : Textarea `@mention`, Drag & drop de fichiers, Micro dictée vocale
   ├── Choix du mode : Dropdown [Agent | Chat | Gather], Slider de réflexion [Reasoning Budget]
   └── Envoi (Submit)
           ↓
[Streaming LLM & Exécution Agentique]
   ├── Bloc Accordéon "Thinking / Reasoning" (dépliable, badge d'état)
   ├── Appels d'outils (Tool Calls) :
   │     ├── Read File, Search, List Dir
   │     ├── Edit File (calcul de diffs en streaming)
   │     ├── Terminal Execution (commande avec ou sans approbation)
   │     └── MCP Tools (appels de serveurs externes)
   ├── Barre d'approbation (si confirmation requise)
   └── Fast Apply (Génération de Diffs dans l'éditeur)
           ↓
[CommandBarInChat & VoidCommandBar dans l'éditeur]
   ├── En-tête des diffs : Compteur de fichiers modifiés, badges de statut
   ├── Navigation entre les diffs (Up / Down) et entre fichiers (Left / Right)
   └── Actions : "Accept File", "Reject File", "Accept All", "Reject All"
```

### 2.4 Parcours D — Configuration et Paramètres
```text
[Clic sur Engrenage (Chat Header / Layout Controls / Bottom Left) ou F1 > "Codeen: Open Settings"]
           ↓
[Ouverture de l'Editor Tab custom `VoidSettingsPane` (ressource `void:settings`)]
   ├── Navigation par onglets verticaux :
   │     Models | Voice | Ollama | MLX | Apple | Local | Providers | Feature Options | General | MCP | All
   ├── Configuration granulaire par feature (Chat, Ctrl+K, Autocomplete, Fast Apply, SCM)
   ├── Paramétrage des modèles vocaux locaux Whisper (Zero-Cloud)
   ├── 1-Click Switch & Import/Export JSON
   └── Contrôle de la télémétrie & Instructions Système (`.voidrules`)
```

---

## 3. Inventaire Exhaustif des Écrans et Surfaces UI

| ID | Surface | Écran / Vue | Déclencheur | Éléments Principaux | États | Interaction | Portée | Origine Technique | Niveau Personnalisation | Priorité Redesign |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| **SCR-01** | Overlay | **Onboarding Welcome** | Premier lancement (`!isOnboardingComplete`) | Logo Codeen SVG animé, Titre "Welcome to Codeen", Bouton CTA "Get Started", Bouton "X" | Initial, FadeIn, Closing | Clic "Get Started", Clic "X" (Skip) | ONBOARDING | React (`VoidOnboarding.tsx`) | NIVEAU 3 (Component) | **P0** |
| **SCR-02** | Overlay | **Onboarding Providers** | Clic "Get Started" depuis SCR-01 | Onglets (Free, Paid, Local, Cloud), Formulaire Clés API, Checklist des features (Chat, Ctrl+K, etc.), Section Whisper local, Navigation Back/Skip/Next | Valide, Invalide, Erreur clé, Modèles détectés | Switch onglets, saisie clés, bouton Next, Skip | ONBOARDING | React (`VoidOnboarding.tsx`) | NIVEAU 3 (Component) | **P0** |
| **SCR-03** | Overlay | **Onboarding Theme Picker** | Next depuis SCR-02 | Cartes d'aperçu de 4 thèmes avec mini-éditeur syntaxique, checkmarks de sélection active | Selected, Unselected, Hover | Clic carte (applique immédiatement le thème à l'IDE via ConfigurationService) | ONBOARDING | React (`VoidOnboarding.tsx`) | NIVEAU 3 (Component) | **P1** |
| **SCR-04** | Overlay | **Onboarding Settings Import** | Next depuis SCR-03 | Titre, boutons 1-Click Switch ("VS Code", "Cursor", "Windsurf"), CTA "Enter Codeen" | Idle, Importing, Success, Error | Clic import, Clic "Enter Codeen" (ferme l'onboarding) | ONBOARDING | React (`VoidOnboarding.tsx`) | NIVEAU 3 (Component) | **P1** |
| **SCR-05** | Editor Area | **Empty Editor Home** | Aucun éditeur ouvert | Grand Logo Codeen (96px), Titre "Beyond Code Completion", sous-titre "An Agentic AI IDE", liste des raccourcis clés cliquables | Dark / Light, Hover raccourcis | Clic sur les raccourcis pour exécuter la commande VS Code | WORKSPACE / EDITOR | React (`EmptyEditorHome.tsx`) | NIVEAU 3 (Component) | **P0** |
| **SCR-06** | Auxiliary Bar | **Sidebar Chat (Landing)** | Clic icône Codeen (droite) ou `Ctrl+L` sans message | Header avec actions (New Chat, Threads, Settings, Close), Zone d'input (`VoidChatArea`), suggestions de prompts ("Summarize my codebase", etc.), liste des threads passés | Empty, Suggestions, Recent Threads | Clic suggestion (lance le prompt), clic thread passé | AI | React (`SidebarChat.tsx`) | NIVEAU 3 (Component) | **P0** |
| **SCR-07** | Auxiliary Bar | **Sidebar Chat (Active Conversation)** | Soumission d'un prompt | Fil de messages (User bubble, Assistant bubble), rendu Markdown riche, blocs de code avec Copy/Apply, zone d'input fixée en bas, CommandBar de diffs | Streaming, Idle, Erreur, Awaiting Approval | Scroll, Copy code, Apply code, Regenerate, Edit user prompt | AI | React (`SidebarChat.tsx`) | NIVEAU 3 (Component) | **P0** |
| **SCR-08** | Auxiliary Bar | **Chat Thread Selector (Historique)** | Clic sur l'icône Historique dans le header Chat | Liste des conversations avec titre généré, date relative, compteur de messages, bouton supprimer, bouton nouveau chat | Normal, Empty, Hover, Selected | Sélection de thread, suppression, renommage | AI | React (`SidebarThreadSelector.tsx`) | NIVEAU 3 (Component) | **P1** |
| **SCR-09** | Editor Tab | **Codeen Settings Hub** | Engrenage du Chat, Layout Controls, ou `F1 > Codeen: Open Settings` | Sidebar de navigation (Models, Voice, Providers, etc.), sélecteurs de modèles par fonctionnalité, configuration des providers, switches d'options, MCP | Prêt, Sauvegarde automatique, Test de connexion en cours, Erreur | Dropdowns, Switches, Inputs masqués pour clés API, Boutons refresh | SETTINGS | React (`Settings.tsx` + `VoidSettingsPane.ts`) | NIVEAU 3 (Component) | **P0** |
| **SCR-10** | Status Bar | **Token Usage & Cost Widget** | Toujours visible en bas à gauche (`codeen.tokenUsage`) | Icône flamme `$(flame)`, compteur de tokens (ex: `12.4k`), coût estimé en dollars (ex: `$0.04`) | Normal, Hover avec infobulle détaillée | Clic pour ouvrir le modal `TokenUsageDialog` | GLOBAL / STATUSBAR | VS Code Contribution (`tokenUsageStatusBar.ts`) | NIVEAU 2 (CSS/Theme) | **P1** |
| **SCR-11** | Overlay Modal | **Token Usage & Cost Dashboard** | Clic sur le widget statusbar SCR-10 | En-tête avec titre et bouton fermer, Total tokens & dollars, graphiques/tableau d'historique journalier (7 derniers jours), détail par provider | Ouvert, Fermé, Filtré | Fermeture (Escape, Clic fond, Clic croix), interaction graphique | OVERLAY | React (`TokenUsageDialog.tsx`) | NIVEAU 3 (Component) | **P1** |
| **SCR-12** | Monaco Floating | **Quick Edit Zone (Ctrl+K)** | Raccourci `Ctrl+K` dans un éditeur avec sélection | Widget flottant intégré dans le flux du code (ZoneWidget Monaco), champ d'instructions avec `@mention`, sélecteur de modèle, bouton Run/Stop | Idle, Saisie, Streaming, Diff actif | Saisie d'instruction, Entrée (lance la modification inline), Échap | EDITOR / AI | React (`QuickEditChat.tsx` + `quickEditActions.ts`) | NIVEAU 3 (Component) | **P0** |
| **SCR-13** | Monaco Floating | **Code Selection Popover Helper** | Sélection de texte dans l'éditeur actif | Petite barre flottante au-dessus de la sélection : boutons "Chat (Ctrl+L)", "Edit (Ctrl+K)", bouton menu "..." | Affiché, Hover, Clic | Clic déclenche l'action associée avec la sélection en contexte | EDITOR / AI | React (`VoidSelectionHelper.tsx`) | NIVEAU 3 (Component) | **P2** |
| **SCR-14** | Monaco Floating | **Fast Apply Command Bar** | Modifications proposées par l'agent sur un ou plusieurs fichiers | Barre flottante en haut de l'éditeur : Boutons "Accept All", "Reject All", "Accept File", "Reject File", flèches de navigation dans les diffs, compteur `X/Y diffs` | Active, Streaming, Completed | Clic sur les boutons de validation / rejet, raccourcis clavier | EDITOR / AI | React (`VoidCommandBar.tsx`) | NIVEAU 3 (Component) | **P0** |
| **SCR-15** | Workbench Shell | **Title Bar / Command Center** | Permanent en haut de fenêtre | Titre de l'application "Codeen", Command Center central (recherche / `Ctrl+P`), Layout Controls (toggle sidebar, panel, auxbar), engrenage réglages Codeen | Fenêtre active / inactive, plein écran | Clic sur la barre de recherche globale, contrôles de fenêtrage | GLOBAL / WORKSPACE | VS Code Native (`titlebarPart.ts`) | NIVEAU 4 (Workbench) + Thème | **P1** |
| **SCR-16** | Workbench Shell | **Activity Bar (Gauche)** | Permanent à gauche (ou masquée) | Icônes Explorer, Search, Source Control, Run & Debug, Extensions, Accounts, Gear (Paramètres généraux) | Normal, Hover, Actif, Badge numérique (ex: modifications Git) | Clic pour ouvrir la vue correspondante dans la Sidebar gauche | GLOBAL / WORKSPACE | VS Code Native (`activitybarPart.ts`) | NIVEAU 1 (Thème / Icons) | **P2** |
| **SCR-17** | Workbench Shell | **Auxiliary Bar (Droite)** | Ouverte par défaut (`codeen-view-icon`) | En-tête "CHAT", boutons d'action de vue, hébergement de la vue React `SidebarViewPane` | Ouverte, Réduite, Maximisée | Clic icône pour réduire/agrandir, resize sash | GLOBAL / WORKSPACE | VS Code Native (`auxiliarybarPart.ts`) | NIVEAU 2 (CSS/Theme) | **P1** |
| **SCR-18** | Workbench Shell | **Primary Sidebar (Gauche)** | Activée par l'Activity Bar | Arbres de navigation de fichiers (Explorer), recherche globale (Search), commits/diffs Git (SCM), Marketplace d'extensions | Déplié, Replié, Chargement d'arbre, Filtrage | Arborescence, Drag & Drop, Clic droit contextuel | WORKSPACE | VS Code Native (`sidebarPart.ts`) | NIVEAU 1 (Thème) | **P3** (Préserver natif) |
| **SCR-19** | Workbench Shell | **Bottom Panel (Terminal / Output / Problems)** | Ouvert via ``Ctrl+` `` ou menu View | Onglets Terminal, Output, Problems, Debug Console. Terminaux interactifs (Powershell, bash, void background terminals) | Actif, Caché, Maximisé, Erreur dans problems | Saisie console, sélection d'onglet, split terminal | WORKSPACE | VS Code Native (`panelPart.ts`) | NIVEAU 1 (Thème) | **P2** (Préserver natif) |
| **SCR-20** | Editor Core | **Monaco Code Editor & Tabs** | Ouverture d'un fichier | Onglets de fichiers (Tabs), Breadcrumbs de navigation, Numéros de ligne, Minimap, Curseur, Autocomplétion Ghost Text (FIM) | Actif, Dirty (non sauvegardé), Split horizontal/vertical | Édition, Navigation, Raccourcis, Inline Diff decorations | EDITOR | VS Code Native (`editorPart.ts` + Monaco) | NIVEAU 1 (Thème) + Extensions | **P4** (STRICTEMENT NATIF) |

---

## 4. Fiches Détaillées des Écrans Majeurs

### 4.1 Fiche SCR-01 & SCR-02 : Onboarding Flow (Bienvenue & Providers)
* **Nom** : Codeen Onboarding Overlay
* **Identifiant technique** : `VoidOnboarding` (monté via `voidOnboardingService.ts` dans `#workbench.main.container`)
* **Objectif utilisateur** : Découvrir Codeen, connecter au moins un fournisseur de modèle (clé gratuite Gemini/OpenRouter ou clé payante ou modèle local Ollama/Whisper) et entrer rapidement dans l'IDE.
* **Comment l'utilisateur y arrive** : Automatiquement au lancement tant que `voidSettingsService.globalSettings.isOnboardingComplete` est `false`.
* **Comment l'utilisateur en sort** :
  - En complétant les 4 étapes et en cliquant sur "Enter Codeen".
  - En cliquant sur la croix "X" (Skip) en haut à droite.
  - En cliquant sur "Skip for now" sur la page des providers.
* **Éléments visibles** :
  - Conteneur plein écran semi-opaque (`bg-void-bg-3`, z-index 99999).
  - Page 0 : Logo Codeen SVG animé (composant `CodeenLogo`), titre typographique "Welcome to Codeen", bouton primaire "Get Started".
  - Page 1 : Colonne gauche de tabs de catégories (Free, Paid, Local, Cloud/Other) + Checklist interactive des fonctionnalités IA avec coches vertes ; Colonne droite de saisie des clés API et réglages de modèles + Bloc de modèle vocal Whisper local ; Boutons de navigation (Back, Skip, Next).
* **Éléments interactifs** : Tabs de providers, champs de texte sécurisés (masquage de clé), checkboxes d'activation de modèle, bouton Next avec validation préventive (affiche un warning ambré si aucun modèle Chat n'est sélectionné sans avoir cliqué sur Skip).
* **États** : Initial, Erreur de validation de clé, Chargement de modèles locaux (spinners), FadeIn de transition (2000ms), Dismissal (fondu de fermeture de 1000ms).
* **Tokens & Styles utilisés** :
  - `bg-void-bg-3` (`--vscode-editor-background`)
  - `bg-void-bg-2` (`--vscode-sideBar-background`)
  - `text-void-fg-1` (`--vscode-editor-foreground`)
  - `text-void-fg-3` (`--vscode-input-placeholderForeground`)
  - Boutons primaires en inversion dynamique noir/blanc (`dark:bg-white/90 dark:text-black`).
* **Fichiers sources** :
  - [src/vs/workbench/contrib/void/browser/react/src/void-onboarding/VoidOnboarding.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-onboarding/VoidOnboarding.tsx)
  - [src/vs/workbench/contrib/void/browser/voidOnboardingService.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/voidOnboardingService.ts)
  - [src/vs/workbench/contrib/void/browser/react/src/util/CodeenLogo.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/util/CodeenLogo.tsx)
* **Points à préserver** : La possibilité de sauter l'étape (Skip) pour ne jamais bloquer un utilisateur hors-ligne ; la compatibilité avec tous les providers locaux et cloud.
* **Points à améliorer lors du futur redesign** :
  - Remplacer les boutons génériques par des composants du design system Codeen unifié.
  - Offrir une barre de progression par étapes (Steppers 1-4) plus visuelle et moderne.

---

### 4.2 Fiche SCR-05 : Empty Editor Home
* **Nom** : Accueil Éditeur Vide
* **Identifiant technique** : `EmptyEditorHome` (monté dans l'editor group lorsqu'aucun fichier n'est actif)
* **Objectif utilisateur** : Guider l'utilisateur lorsqu'il n'a pas encore ouvert de document ou de projet, lui fournir un repère visuel fort et des raccourcis actionnables.
* **Comment l'utilisateur y arrive** : Fermeture de tous les éditeurs ou ouverture d'une nouvelle fenêtre sans fichier ouvert.
* **Comment l'utilisateur en sort** : Ouverture d'un fichier (via Explorer, Quick Open `Ctrl+P`, drag & drop, ou clic sur un raccourci).
* **Éléments visibles** :
  - Conteneur centré pleine hauteur.
  - Logo Codeen grand format (96px).
  - Titre : `Beyond Code Completion` (Police Outfit / Inter, semi-bold).
  - Sous-titre : `An Agentic AI IDE` (opacity 80%).
  - Boîte de raccourcis stylisée avec bordure subtile contenant les raccourcis configurés par l'utilisateur.
* **Éléments interactifs** : Lignes de raccourcis cliquables (déclenchent `executeCommand` sur l'ID de la commande associée).
* **Tokens & Styles utilisés** :
  - `bg-void-bg-3` (fond)
  - `bg-void-bg-1` (`--vscode-input-background`, fond du bloc)
  - `border-void-border-2` (`--vscode-commandCenter-border`)
* **Fichiers sources** :
  - [src/vs/workbench/contrib/void/browser/react/src/empty-editor-home-tsx/EmptyEditorHome.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/empty-editor-home-tsx/EmptyEditorHome.tsx)
* **Points à préserver** : La résolution dynamique des touches clavier réelles de l'utilisateur (`keybindingService.lookupKeybinding`).
* **Points à améliorer lors du futur redesign** :
  - Ajouter des actions directes : "Open Folder / Project", "Clone Repository", "Start with an AI Prompt".
  - Afficher une liste des projets récemment ouverts.

---

### 4.3 Fiche SCR-06 & SCR-07 : Sidebar Chat & Agentic Workflow
* **Nom** : Codeen Chat & Agent Panel
* **Identifiant technique** : `SidebarChat` monté dans `SidebarViewPane` (Auxiliary Bar)
* **Objectif utilisateur** : Dialoguer avec l'IA, orchestrer des tâches complexes (recherche, modification de multiples fichiers, commandes terminal, outils MCP), inspecter les raisonnements et appliquer les diffs.
* **Comment l'utilisateur y arrive** : Clic sur l'icône Codeen dans la barre latérale droite ou raccourci `Ctrl+L`.
* **Comment l'utilisateur en sort** : Fermeture de l'Auxiliary Bar ou bascule vers une autre vue.
* **Structure & Composants internes** :
  1. **Header** : Titre "CHAT", boutons "+ (New Thread)", "Historique (Threads list)", "Paramètres (Gear)", "Fermer".
  2. **Zone de Messages (`messagesHTML`)** :
     - Messages utilisateur : bulle avec texte, badges des fichiers attachés (@mentions, sélections avec lignes `L10-L25`), images attachées, bouton "Edit prompt".
     - Messages assistant :
       - **Bloc Thinking / Reasoning** : panneau accordéon rétractable affichant la pensée du modèle avec badge de durée et animation de pulsation.
       - **Rendu Markdown** : coloration syntaxique du code, rendu des tables et listes, boutons d'action rapide sur les blocs de code (Copier, Appliquer dans l'éditeur).
       - **Tool Calls Wrappers** :
         - `read_file` : affiche le chemin du fichier, le nombre de lignes lues, bouton d'ouverture.
         - `edit_file` : affiche le nom du fichier, les compteurs de lignes ajoutées/supprimées (`+12 -4`), aperçu du diff.
         - `terminal` : bloc type console affichant la commande exécutée et sa sortie terminal en temps réel.
         - `mcp` : affiche le serveur MCP, le nom de l'outil et les paramètres JSON.
       - **Demande d'approbation (Approval Bar)** : bouton "Approve" (vert) et "Reject" (rouge) lorsque les outils nécessitent le consentement de l'utilisateur.
  3. **Barre de commande de Diff (`CommandBarInChat`)** :
     - Affiche le résumé des modifications en cours : `X files modified`.
     - Boutons d'application globale : "Accept All" (coche), "Reject All" (croix).
     - Liste déroulante des fichiers impactés avec statut individuel.
  4. **Zone de saisie inférieure (`VoidChatArea`)** :
     - Conteneur de saisie avec focus ring dynamique.
     - Liste des fichiers mis en scène (*staging selections*).
     - Textarea multi-lignes avec auto-expand et complétion `@` (mention de fichiers, dossiers, symboles).
     - Barre de contrôles en bas du champ :
       - Dropdown de mode : **Agent** (autonome, outils d'écriture), **Chat** (conversationnel), **Gather** (lecture seule et recherche).
       - Dropdown de modèle : bascule instantanée entre modèles configurés.
       - Bouton trombone / attachement de fichiers & images.
       - Jauge contextuelle (*Context Window Indicator*) : anneau SVG circulaire indiquant le taux d'utilisation du contexte du modèle.
       - Bouton microphone (dictée locale Whisper).
       - Bouton Soumettre (flèche vers le haut) ou Stopper (carré stop si streaming en cours).
* **Fichiers sources** :
  - [src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarChat.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarChat.tsx)
  - [src/vs/workbench/contrib/void/browser/sidebarPane.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/sidebarPane.ts)
* **Points à préserver** : Le respect scrupuleux des Règles des Hooks React, le streaming en temps réel, l'isolation des threads.
* **Points à améliorer lors du futur redesign** :
  - Épurer les bordures et les espacements pour un rendu plus aéré et moderne.
  - Uniformiser l'apparence des blocs d'outils (Tool Calls) pour éviter le bruit visuel dans les longues sessions agentiques.

---

### 4.4 Fiche SCR-09 : Codeen Settings Hub
* **Nom** : Centre de Contrôle des Paramètres Codeen
* **Identifiant technique** : `VoidSettingsPane` (monté comme un éditeur natif VS Code via `EditorInput`)
* **Objectif utilisateur** : Configurer finement les clés d'API, les modèles affectés à chaque fonctionnalité de l'IDE, les serveurs MCP, les modèles vocaux locaux et les options de transition.
* **Comment l'utilisateur y arrive** : Clic sur l'icône engrenage dans le Chat, dans la barre de layout ou commande `Codeen: Open Settings`.
* **Comment l'utilisateur en sort** : Fermeture de l'onglet de paramètres (comme n'importe quel onglet d'éditeur).
* **Structure & Onglets** :
  - Navigation latérale : `Models`, `Voice`, `Ollama`, `MLX`, `Apple`, `Local Other`, `Providers`, `Feature Options`, `General`, `MCP`, `All`.
  - Section Models : association d'un modèle par fonctionnalité :
    - Chat
    - Quick Edit (`Ctrl+K`)
    - Autocomplete
    - Fast Apply
    - Source Control (SCM)
  - Section Voice : téléchargement, sélection de modèle Whisper (tiny, base, small), test du micro.
  - Section Providers : gestion sécurisée des clés d'API pour 15+ fournisseurs cloud et locaux.
  - Section Feature Options : seuils d'approbation d'outils, options de complétion en arrière-plan.
  - Section General : One-Click Switch depuis VS Code/Cursor/Windsurf, Import/Export JSON, désactivation de la télémétrie.
  - Section MCP : liste des serveurs configurés dans `mcp_config.json`, état des connexions, bascule des outils.
* **Fichiers sources** :
  - [src/vs/workbench/contrib/void/browser/react/src/void-settings-tsx/Settings.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-settings-tsx/Settings.tsx)
  - [src/vs/workbench/contrib/void/browser/voidSettingsPane.ts](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/voidSettingsPane.ts)
* **Points à préserver** : La séparation claire entre les paramètres IA de Codeen et les paramètres natifs de VS Code (qui restent accessibles via le bouton "General Settings").
* **Points à améliorer lors du futur redesign** :
  - Moderniser la barre latérale de navigation avec des icônes plus fines et une hiérarchie visuelle plus claire.

---

### 4.5 Fiche SCR-12 & SCR-14 : In-Editor Agentic Controls (Quick Edit & Fast Apply)
* **Nom** : Quick Edit & Fast Apply Bar
* **Identifiant technique** : `QuickEditChat` (ZoneWidget) et `VoidCommandBar` (Overlay widget dans Monaco)
* **Objectif utilisateur** : Modifier du code directement au cœur du document sans quitter le flux de travail de l'éditeur.
* **Comment l'utilisateur y arrive** :
  - Quick Edit : sélection de lignes + `Ctrl+K`.
  - Fast Apply : généré automatiquement dès que le modèle propose un bloc de modifications dans le chat ou en inline.
* **Éléments visibles** :
  - Quick Edit : boîte flottante insérée entre les lignes de code avec champ d'instruction et dropdown de modèle.
  - Fast Apply : barre d'action flottante fixée au-dessus de la première ligne modifiée avec badges "Accept All", "Reject All", "Accept File", "Reject File", et compteurs de diffs.
* **Fichiers sources** :
  - [src/vs/workbench/contrib/void/browser/react/src/quick-edit-tsx/QuickEditChat.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/quick-edit-tsx/QuickEditChat.tsx)
  - [src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidCommandBar.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidCommandBar.tsx)
* **Points à préserver** : L'ancrage fluide dans le layout de Monaco sans créer de décalage de défilement (scroll jitter).
* **Points à améliorer lors du futur redesign** :
  - Harmoniser le style des boutons Accept/Reject avec les standards de couleur du design system Codeen.

---

## 5. Cartographie des Éléments Globaux du Workbench

### 5.1 Title Bar (Header Supérieur)
* **Technologie** : DOM natif VS Code (`titlebarPart.ts`) stylisé par CSS.
* **Composants** :
  - **Window Controls** : boutons minimiser, agrandir, fermer (style Windows/Mac natif ou custom).
  - **App Title / Brand** : nom de l'application et workspace ouvert.
  - **Command Center** : champ de recherche centralisé cliquable (`Ctrl+P`, recherche de symboles `@`, commandes `>`).
  - **Layout Controls** : boutons à bascule pour afficher/masquer la sidebar gauche, le panneau inférieur et l'auxiliary bar droite.
  - **Codeen Settings Quick Action** : bouton engrenage déclenchant les réglages de Codeen.

### 5.2 Activity Bar (Barre Latérale Gauche)
* **Technologie** : DOM natif VS Code (`activitybarPart.ts`).
* **Icônes présentes** :
  - Explorer (`Codicon.files`)
  - Search (`Codicon.search`)
  - Source Control (`Codicon.sourceControl`)
  - Run and Debug (`Codicon.debugAlt`)
  - Extensions (`Codicon.extensions`)
  - Accounts (`Codicon.account`)
  - Settings Gear (`Codicon.settingsGear`)
* **Personnalisation possible** : Remplacement des icônes par des Codicons alternatifs ou SVG injectés (Niveau 1/2).

### 5.3 Auxiliary Bar (Barre Latérale Droite — Codeen Core)
* **Technologie** : Conteneur natif VS Code (`auxiliarybarPart.ts`) hébergeant le composant React `SidebarViewPane`.
* **Icône de conteneur** : `codeen-view-icon` (SVG en masque CSS injecté dans `void.css`).
* **Comportement** : Ouverte par défaut dès le démarrage du Workbench pour mettre immédiatement l'agent à portée de main.

### 5.4 Editor Group & Tab Bar (Zone Centrale)
* **Technologie** : Monaco Editor + Workbench Editor Part.
* **Composants** :
  - Onglets de fichiers avec indicateur "dirty" (rond blanc pour fichier non sauvegardé).
  - Boutons de fractionnement d'éditeur (Split horizontal / vertical).
  - Breadcrumbs (chemin hiérarchique du fichier et symboles de fonctions/classes).
  - Gutter de marge avec numéros de ligne et indicateurs de pliage de code (folding).
  - Minimap sur le bord droit de l'éditeur.

### 5.5 Status Bar (Barre Inférieure)
* **Technologie** : DOM natif VS Code (`statusbarPart.ts`).
* **Contributions spécifiques Codeen** :
  - **Token Usage Widget** : `$(flame) <tokens> (<cost>)` à gauche (priorité 100).
* **Contributions natives VS Code** :
  - Branche Git active / synchronisation.
  - Erreurs et avertissements (`$(error) 0 $(warning) 2`).
  - Position du curseur (`Ln 42, Col 18`).
  - Encodage (`UTF-8`), fin de ligne (`CRLF`/`LF`), indentation (`Spaces: 4`).
  - Mode de langage (`TypeScript`).

---

## 6. Inventaire des Overlays, Modals, Popovers et Menus

1. **TokenUsageDialog** (`SCR-11`) : Fenêtre modale centrée avec backdrop assombri, affichant la télémétrie financière et de tokens.
2. **VoidSelectionHelper** (`SCR-13`) : Popover flottant attaché au curseur lors d'une sélection de texte dans l'éditeur.
3. **Command Palette (`Ctrl+Shift+P` / `F1`)** : QuickPick modal en haut de fenêtre pour rechercher toutes les commandes disponibles.
4. **Quick Open (`Ctrl+P`)** : Recherche rapide de fichiers avec filtre fuzzy.
5. **Context Menus** :
   - Clic droit éditeur : "Chat: Add selection to chat (`Ctrl+L`)", "Edit: Quick Edit (`Ctrl+K`)".
   - Clic droit explorateur de fichiers : "Add File to Codeen Chat", "Reference Folder in Codeen".
   - Clic droit onglet d'éditeur : Fermer, épingler, dupliquer, ouvrir à côté.
6. **Tooltips (`void-tooltip`)** : Infobulles réactives rendues par `react-tooltip` avec styles sombres et délais courts.
7. **Notifications Toasts** : Zone de notifications en bas à droite pour les messages d'erreur, succès ou alertes de build.

---

## 7. Système de Design Existant : Thèmes, Tokens, Typographie & Icônes

### 7.1 Système de Couleurs et Tokens Dérivés
Codeen s'appuie sur une couche d'abstraction définie dans `styles.css` qui fait le pont entre Tailwind CSS et les variables de thème VS Code :

```css
--void-bg-1: var(--vscode-input-background);
--void-bg-1-alt: var(--vscode-badge-background);
--void-bg-2: var(--vscode-sideBar-background);
--void-bg-2-alt: color-mix(in srgb, var(--vscode-editor-background) 30%, var(--vscode-sideBar-background) 70%);
--void-bg-2-hover: color-mix(in srgb, var(--vscode-editor-foreground) 2%, var(--vscode-sideBar-background) 98%);
--void-bg-3: var(--vscode-editor-background);

--void-fg-0: color-mix(in srgb, var(--vscode-tab-activeForeground) 90%, black 10%);
--void-fg-1: var(--vscode-editor-foreground);
--void-fg-2: var(--vscode-input-foreground);
--void-fg-3: var(--vscode-input-placeholderForeground);
--void-fg-4: var(--vscode-list-deemphasizedForeground);

--void-border-1: var(--vscode-commandCenter-activeBorder);
--void-border-2: var(--vscode-commandCenter-border);
--void-border-3: var(--vscode-commandCenter-inactiveBorder);
--void-border-4: var(--vscode-editorGroup-border);

--void-ring-color: #007FD4;
--void-link-color: #007FD4;
```

### 7.2 Typographie Actuelle
* **Interface UI** : Polices système par défaut (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`).
* **Code et Monaco** : `Consolas`, `Monaco`, `Courier New`, `monospace`.
* **Titres de marque (Empty Editor / Onboarding)** : Famille `Outfit`, `Inter` ou polices sans-serif légères (`font-light` / `font-semibold`).

### 7.3 Système d'Iconographie
* **VS Code Shell** : Police de caractères d'icônes vectorielles **Codicons** (`.codicon-...`).
* **Composants React Codeen** : Bibliothèque d'icônes **Lucide React** (`Check`, `X`, `ChevronRight`, `RefreshCw`, `Flame`, `Mic`, `Loader2`, `DollarSign`, etc.).
* **Marque Codeen** :
  - Logo SVG vectoriel pur dans [CodeenLogo.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/util/CodeenLogo.tsx) (dégradé linéaire cyan `#00D1FF` vers indigo `#2563FF`).
  - Masque SVG dans `void.css` pour l'icône de l'Auxiliary Bar.

---

## 8. Matrice de Priorité et Niveau de Personnalisation

| Surface / Composant | Origine Technique | Niveau Personnalisation | Priorité Redesign | Règle Opérationnelle |
|:---|:---|:---|:---|:---|
| **Logo & Identité Visuelle** | Codeen React/SVG | **Niveau 3 (Component)** | **P0** | Définir la charte de marque (icônes, splash, onboarding). |
| **Onboarding Experience** | Codeen React | **Niveau 3 (Component)** | **P0** | Refonte complète de la séquence d'accueil et des formulaires de setup. |
| **Empty Editor Home** | Codeen React | **Niveau 3 (Component)** | **P0** | Transformer la page d'accueil avec des actions d'ouverture et templates. |
| **Chat & Agent Interaction UI** | Codeen React | **Niveau 3 (Component)** | **P0** | Épurer la zone de saisie, les tool calls et les blocs reasoning. |
| **Fast Apply & Diff Command Bar** | Codeen React | **Niveau 3 (Component)** | **P0** | Unifier le design des boutons de validation/rejet de code. |
| **Title Bar & Command Center** | VS Code Native | **Niveau 2 (CSS/Theme)** | **P1** | Styliser la barre de titre pour lui donner un aspect natif élégant et épuré. |
| **Settings Hub (Codeen)** | Codeen React | **Niveau 3 (Component)** | **P1** | Moderniser la mise en page des paramètres IA et des cartes de providers. |
| **Token Usage & Cost Dashboard** | Codeen React | **Niveau 3 (Component)** | **P1** | Rendre le dashboard financier plus graphique et lisible. |
| **Quick Edit (Ctrl+K)** | Codeen React | **Niveau 3 (Component)** | **P1** | Affiner les bordures, ombres et focus states du widget flottant. |
| **Status Bar (Token Widget)** | VS Code Contribution | **Niveau 2 (CSS/Theme)** | **P2** | Ajuster l'icône et la typographie du badge de coût. |
| **Activity Bar & Icônes** | VS Code Native | **Niveau 1 (Theme / Icons)** | **P2** | Fournir un set d'icônes outline cohérent avec l'identité Codeen. |
| **Primary Sidebar (Explorer/Git)** | VS Code Native | **Niveau 1 (Theme)** | **P3** | Conserver 100% natif ; styliser uniquement via les tokens de couleur. |
| **Bottom Panel (Terminal/Console)** | VS Code Native | **Niveau 1 (Theme)** | **P3** | Conserver 100% natif ; styliser les bordures et fonds via le thème. |
| **Monaco Editor Core** | VS Code Native Core | **Niveau 1 (Theme Syntax)** | **P4** | **STRICTEMENT PRÉSERVER LE NATIF** (moteur d'édition, minimap, buffers). |

---

## 9. Inventaire des États Incomplets ou Manquants

### A. Éléments Existants et Fonctionnels
- Onboarding avec 4 pages et skip.
- Chat avec streaming, tool calls (read, edit, bash, mcp), reasoning accordéon et threads multiples.
- Quick Edit flottant (Ctrl+K) et Fast Apply avec navigation dans les diffs.
- Sélecteur de thème dynamique en temps réel.
- Suivi des tokens et coût estimé dans la Status Bar avec modal d'historique 7 jours.

### B. Éléments Incomplets (À Améliorer)
1. **Empty State de l'Historique des Threads** : Dans `SidebarThreadSelector`, lorsqu'aucun thread n'existe, l'état vide est très brut.
2. **Indicateur de Tâche Agentique Complexe (Multi-step Tasks)** : `TaskProgress.tsx` est minimal et pourrait mieux matérialiser les étapes successives d'un plan autonome.
3. **Feedback visuel d'erreur d'outil MCP** : En cas de déconnexion d'un serveur MCP en cours de streaming, le message d'erreur est affiché sous forme de texte brut sans bouton de reconnexion en un clic.

### C. Éléments Absents mais Nécessaires pour une Expérience Premium
1. **Page d'accueil de Projet (Project Overview Dashboard)** : Une vue dédiée affichant la structure du projet, les règles actives (`.voidrules` / `.codeenrules`), les compétences (skills) disponibles et les derniers commits.
2. **Modal de Gestion des Clés d'API Rapide** : Pouvoir changer de clé ou de provider directement depuis la zone de chat sans devoir ouvrir l'onglet entier des paramètres.
3. **Indicateur d'Indexation du Codebase** : Un badge visuel discret indiquant si le workspace a été analysé pour la recherche vectorielle / sémantique (Smart Context).

---

## 10. Liste des Captures d'Écran à Produire pour le Futur Travail UX

Pour alimenter la future équipe de designers, voici les 18 captures de référence à réaliser :
1. `01_onboarding_welcome.png` : Premier écran d'accueil avec logo et bouton Get Started.
2. `02_onboarding_providers_free.png` : Écran des providers avec l'onglet Free actif.
3. `03_onboarding_providers_local.png` : Écran des providers avec Ollama et Whisper local.
4. `04_onboarding_theme_picker.png` : Écran de sélection des thèmes avec cartes d'aperçu.
5. `05_onboarding_settings_import.png` : Écran de migration 1-click depuis VS Code / Cursor / Windsurf.
6. `06_empty_editor_home.png` : Écran central d'accueil lorsqu'aucun fichier n'est ouvert.
7. `07_chat_landing_suggestions.png` : Barre latérale de chat vide avec suggestions de prompts.
8. `08_chat_active_conversation.png` : Discussion en cours avec bulle utilisateur et réponse assistant.
9. `09_chat_thinking_expanded.png` : Bloc de raisonnement (thinking) déplié avec son contenu.
10. `10_chat_tool_call_edit.png` : Bloc d'exécution d'outil `edit_file` avec compteur de diff.
11. `11_chat_tool_call_terminal.png` : Bloc d'exécution de commande terminal.
12. `12_chat_fast_apply_commandbar.png` : Barre de commande de diffs dans le chat (`CommandBarInChat`).
13. `13_editor_fast_apply_floating.png` : Barre de diff flottante dans l'éditeur Monaco (`VoidCommandBar`).
14. `14_quick_edit_ctrl_k.png` : Widget flottant Ctrl+K actif sur une sélection de code.
15. `15_selection_helper_popover.png` : Popover flottant au-dessus d'une sélection de texte.
16. `16_token_usage_dashboard_modal.png` : Modal complet de consommation de tokens et de budget.
17. `17_codeen_settings_models.png` : Onglet Models dans le centre de paramètres Codeen.
18. `18_codeen_settings_mcp.png` : Onglet MCP dans les paramètres avec serveurs configurés.
