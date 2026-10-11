# Spécification Technique : Transformation Native du Workbench & de l'Éditeur Codeen

## 1. Contexte & Vision

La phase précédente a validé l'intégration des 6 binômes d'écrans React (Onboarding, Sidebar Chat, Settings Hub, Token Telemetry, Command Bar, Empty Editor Home) et les premières couleurs de base (Status Bar sombre, badges néon émeraude).
L'objectif de cette nouvelle étape est d'éliminer **toutes les traces résiduelles de VS Code / Void classique** dans les composants natifs du Workbench et de l'éditeur de code, pour que l'expérience soit 100% **Obsidian Precision** dès l'ouverture :

1. **Header & TitleBar** : Fond `#0B0D11`, bordure `#20242D`, Command Center épuré, logo officiel Codeen SVG en haut à gauche à la place de l'ancien cube bleu Microsoft.
2. **Éditeur de code (Monaco Core)** : Fond `#0B0D11` (Obsidian Deep), onglets actifs avec accent néon `#45f99c`, curseur néon `#45f99c`, sélection de texte vert subtil.
3. **Explorateur & Arborescence (File Explorer / Lists)** : Remplacement du bleu VS Code `#0078D4` sur les fichiers sélectionnés (ex: `logo.html`) par le style Codeen (fond discret sombre/vert translucide, texte blanc ou néon).
4. **Widgets d'édition, Inline Diff & Accept/Reject** : Rendu premium des contrôles d'approbation et de rejet de code dans l'éditeur.
5. **Panneau inférieur (Terminal & Logs)** : Fond `#0B0D11`, bordure active d'onglets `#45f99c`, curseur terminal néon.
6. **Typographie Locale Indépendante** : Intégration en local des polices `Outfit` (UI) et `JetBrains Mono` (Code) sans aucun appel réseau vers Google Fonts, pour un fonctionnement hors-ligne immédiat.

---

## 2. Périmètre des Composants Natifs Cibles

| Composant | Fichiers Sources | État Actuel (Hérité) | État Attendu (Codeen Obsidian Precision) |
|---|---|---|---|
| **TitleBar & Header** | `src/vs/workbench/browser/parts/titlebar/media/titlebarpart.css`<br>`src/vs/workbench/browser/media/code-icon.svg`<br>`src/vs/workbench/common/theme.ts` | Gris terne `#3C3C3C`, icône bleue `.st2{fill:#167abf}` | Fond `#0B0D11`, bordure `#20242D`, logo SVG Codeen néon/bleu dégradé |
| **Command Center (Search Header)** | `src/vs/workbench/common/theme.ts` | Gris semi-transparent générique | Fond `#12151B`, bordure `#20242D`, focus `#45f99c` |
| **Monaco Editor Background & Tabs** | `src/vs/workbench/services/themes/common/workbenchThemeService.ts`<br>`extensions/theme-defaults/themes/dark_vs.json`<br>`extensions/theme-defaults/themes/dark_modern.json` | Fond `#1E1E1E` (Dark+), onglet actif bleu `#007ACC` | Fond `#0B0D11`, onglet actif `#12151B` avec surlignage `#45f99c`, bordures `#20242D` |
| **File Tree & Selections** | `src/vs/workbench/common/theme.ts`<br>`extensions/theme-defaults/themes/dark_vs.json` | Sélection bleue `#0078D4` sur items | `rgba(69, 249, 156, 0.12)`, bordure discrète, texte `#F3F4F6` |
| **Inline Diff & Accept/Reject** | `src/vs/workbench/contrib/void/browser/react/src/void-editor-widgets-tsx/VoidCommandBar.tsx`<br>`src/vs/workbench/contrib/void/browser/quickEditActions.ts`<br>`src/vs/workbench/contrib/void/browser/media/void.css` | Styles basiques | Boutons Accept vert émeraude (`#00DC82`), Reject sombre/bordeaux (`#20242D`) |
| **Terminal & Panel** | `src/vs/workbench/common/theme.ts`<br>`src/vs/workbench/browser/parts/panel/media/panelpart.css` | Fond standard sombre | Fond `#0B0D11`, onglet actif `#45f99c`, curseur néon |
| **Typographie Locale** | `src/vs/workbench/browser/media/style.css`<br>`src/vs/base/browser/fonts.ts`<br>`src/vs/editor/common/config/editorOptions.ts` | Segoe UI (Windows) / Consolas | Polices locales embarquées : `Outfit` pour l'UI, `JetBrains Mono` pour le code |

---

## 3. Critères d'Acceptation

1. À l'ouverture de l'IDE via `./scripts/code.bat`, aucun élément bleu Microsoft ou gris `#3C3C3C` n'est visible sur la fenêtre principale.
2. La TitleBar arbore le logo officiel Codeen SVG et une teinte `#0B0D11`.
3. L'éditeur de code possède un fond noir obsidian profond `#0B0D11`, et la sélection d'un fichier dans l'arborescence ne produit plus de bleu.
4. Les polices `Outfit` et `JetBrains Mono` sont chargées localement sans requête externe.
5. La compilation via `npm run buildreact` et `transpile-client-esbuild` s'exécute avec succès en moins d'une minute sur une machine 8 Go.
