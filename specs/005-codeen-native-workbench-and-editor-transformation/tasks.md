# Tasks : Transformation Native Codeen

- [x] **Tâche 1 : Header, TitleBar, Command Center & Remplacement du Logo**
  - [x] 1.1 Remplacer `src/vs/workbench/browser/media/code-icon.svg` par le monogramme C officiel Codeen vectoriel haute précision.
  - [x] 1.2 Mettre à jour `TITLE_BAR_ACTIVE_BACKGROUND`, `TITLE_BAR_INACTIVE_BACKGROUND`, `TITLE_BAR_BORDER` dans `src/vs/workbench/common/theme.ts` (`#0B0D11`, bordure `#20242D`).
  - [x] 1.3 Mettre à jour `COMMAND_CENTER_BACKGROUND`, `COMMAND_CENTER_BORDER`, `COMMAND_CENTER_ACTIVEBORDER` (`#12151B`, `#20242D`, `#45f99c`).

- [x] **Tâche 2 : Éditeur Monaco, Onglets & Explorer Lists**
  - [x] 2.1 Mettre à jour `editor.background` à `#0B0D11` dans `workbenchThemeService.ts`, `dark_vs.json`, `dark_modern.json`.
  - [x] 2.2 Configurer les onglets d'éditeur : onglet actif `#0B0D11` avec liseré `#45f99c`, onglets inactifs `#12151B`, container tabs `#12151B` et bordure `#20242D`.
  - [x] 2.3 Remplacer le bleu de sélection dans les listes/explorateur (`list.activeSelectionBackground`, `list.inactiveSelectionBackground`, `list.focusHighlightForeground`) par la nuance Codeen Obsidian/Néon.
  - [x] 2.4 Harmoniser le panneau inférieur (Terminal & Problems) : fond `#0B0D11`, bordure onglet actif `#45f99c`.

- [x] **Tâche 3 : Widgets Inline Diff & Boutons Accept / Reject**
  - [x] 3.1 Vérifier et styliser les boutons d'approbation (`Approuver / Accept`) en vert néon émeraude `#00DC82` avec texte `#00391d` et icône de validation.
  - [x] 3.2 Styliser les boutons de rejet (`Rejeter / Reject`) avec contraste propre sombre/bordeaux `#20242D` / `#4A1B22`.
  - [x] 3.3 Harmoniser les zones de diff inline Monaco.

- [x] **Tâche 4 : Intégration Locale des Polices Hors-ligne (Outfit & JetBrains Mono)**
  - [x] 4.1 Préparer et intégrer les polices locales dans le répertoire médias du workbench.
  - [x] 4.2 Déclarer les règles `@font-face` locales dans `style.css` et insérer `Outfit` en tête de la pile de fontes UI.
  - [x] 4.3 Ajouter `JetBrains Mono` dans les fontes par défaut de l'éditeur dans `editorOptions.ts`.

- [x] **Tâche 5 : Compilation Globale & Validation Visuelle**
  - [x] 5.1 Exécuter la transpilation native esbuild (`transpile-client-esbuild`).
  - [x] 5.2 Exécuter `npm run buildreact` pour synchroniser les interfaces.
  - [x] 5.3 Valider le résultat dans `out/` et confirmer le lancement.
