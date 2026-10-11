# Plan d'Architecture & d'Implémentation : Intégration du Design Stitch dans Codeen

## 1. Principes Directeurs

1. **Architecture par Couches Étanches** :
   - Les styles de base et variables CSS sont injectés en amont dans `src/vs/workbench/contrib/void/browser/react/src/styles.css` pour alimenter Tailwind et les classes React.
   - Les composants React Codeen sont rénovés individuellement dans leur arborescence existante (`src/vs/workbench/contrib/void/browser/react/src/`).
   - Les widgets Monaco (`VoidCommandBar`, `QuickEditChat`, `VoidSelectionHelper`) conservent leurs cycles de vie natifs d'éditeurs tout en recevant les classes Obsidian Precision.
2. **Préservation Intégrale des Services & Flux de Données** :
   - Aucun mock de données en production.
   - Respect strict des hooks React et des patterns de subscriptions VS Code (`IDisposable`).
3. **Approche Progressive et Vérifiable** :
   - Chaque phase est validée par compilation (`buildreact`) et vérification de typage.

---

## 2. Découpage des Phases de Travail

### Phase 1 : Infrastructure des Tokens & Thème (Jalon Fondations)
- Déclarer les variables CSS `--codeen-*` dans `styles.css`.
- Configurer les utilitaires de couleurs, polices (`Outfit`, `JetBrains Mono`) et ombres dans `tailwind.config.js`.
- Enrichir les thèmes VS Code intégrés pour harmoniser les fonds et bordures avec `surface-base` (`#0B0D11`) et `surface-panel` (`#12151B`).

### Phase 2 : Onboarding Rénové (SCR-01 à SCR-04)
- Mettre à niveau [VoidOnboarding.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-onboarding/VoidOnboarding.tsx) :
  - **Step 1 (Welcome)** : Hero title "Beyond Code Completion", mot-symbole `code/een IDE`, 3 cartes piliers (Agentic, Sovereign, Inline).
  - **Step 2 (Providers)** : Grille 2 colonnes avec sélection visuelle et champ API key sécurisé.
  - **Step 3 (Themes)** : Cartes interactives Obsidian Precision avec aperçu dynamique.
  - **Step 4 (Migration)** : Cartes d'import 1-clic avec détection de configuration VS Code existante.

### Phase 3 : Accueil de l'Éditeur Vide (SCR-05)
- Rénover [EmptyEditorHome.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/empty-editor-home-tsx/EmptyEditorHome.tsx) :
  - Logo Codeen grand format avec double `e` inversé et slash émeraude illuminé.
  - Cartes d'actions rapides ("Open Folder", "Clone Repo", "New File") déclenchant les commandes VS Code.
  - Cartes de présentation des capacités AI (Agent multi-fichiers, Quick Edit `Ctrl+K`, Fast Apply).

### Phase 4 : Chat & Panneau d'Agent AI (SCR-06, SCR-07, SCR-08)
- Moderniser [SidebarChat.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarChat.tsx) et ses sous-composants :
  - En-tête de session avec sélecteur de modèle épuré.
  - Bulles de messages et puces de fichiers référencés (`@fichier:lignes`).
  - Bloc accordéon **Thinking Process** avec puce cyan pulsante.
  - Cartes d'exécution d'outils avec liseré sémantique (Cyan pour lecture, Indigo pour MCP, Vert pour modifications).
  - Sélecteur et historique des sessions de discussion [SidebarThreadSelector.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarThreadSelector.tsx).

### Phase 5 : Fast Apply Diff & Monaco Widgets (SCR-12, SCR-13, SCR-14)
- Moderniser la barre d'action Fast Apply dans [VoidCommandBar.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidCommandBar.tsx) :
  - Statistiques de lignes ajoutées/supprimées (`+18 -6`).
  - Boutons jumeaux "Accept File" (`⌘Enter`) et "Reject" (`⌘⌫`).
- Moderniser le popover de sélection [VoidSelectionHelper.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidSelectionHelper.tsx) (`Ctrl+L` / `Ctrl+K`).
- Styliser le ZoneWidget Quick Edit [QuickEditChat.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/quick-edit-tsx/QuickEditChat.tsx).

### Phase 6 : Settings Hub & Token Telemetry Dashboard (SCR-09, SCR-11)
- Réorganiser [Settings.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-settings-tsx/Settings.tsx) selon le layout 2 colonnes avec sous-systèmes navigables.
- Styliser la boîte de dialogue de télémétrie des tokens [TokenUsageDialog.tsx](file:///e:/dev/void/src/vs/workbench/contrib/void/browser/react/src/void-token-usage-tsx/TokenUsageDialog.tsx).

### Phase 7 : Validation Complète & Non-Régression
- Compilation `npm run buildreact` et validation TypeScript.
- Démarrage et inspection visuelle dans l'environnement VS Code/Codeen.
