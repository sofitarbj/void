# Manifeste d'Intégration de la Couche IA Codeen

## Objectif
Ce document recense de manière exhaustive tous les points de contact entre la couche IA Codeen et le socle upstream VS Code. Il garantit que lors d'un futur rebase vers VS Code 1.121+, l'ensemble des intégrations puisse être réappliqué de façon propre et déterministe.

---

## 1. Module Métier Autonome (Auto-Contenu)
Le cœur de Codeen réside intégralement dans le sous-dossier dédié :
- `src/vs/workbench/contrib/void/` :
  - `browser/` : Services UI, contributions, widgets de commande, gestionnaires de threads.
  - `browser/react/` : Arborescence React complète (Chat sidebar, Empty Editor Home, Token Usage Dialog, Quick Edit, Onboarding).
  - `common/` : Contrats, interfaces, estimateur BPE (`tokenizer.ts`), suivi de budget et de consommation (`tokenUsageService.ts`, `voidBudgetService.ts`), mémoire projet (`voidMemoryService.ts`).
  - `electron-main/` : Ponts IPC pour les processus sous-jacents (MCP, terminaux natifs).

---

## 2. Points d'Accrochage dans le Socle Upstream VS Code

| Fichier Upstream | Rôle du Patch Codeen |
| :--- | :--- |
| `src/vs/workbench/browser/parts/editor/editorGroupWatermark.ts` | Monte le composant React `EmptyEditorHome` lors de l'ouverture d'un workspace vide. |
| `src/vs/workbench/browser/parts/editor/media/editorgroupview.css` | Définit les classes `.codeen-empty-editor-home`, `.codeen-home-visible`, `.codeen-home-active`. |
| `src/vs/workbench/workbench.common.main.ts` | Enregistre le module `src/vs/workbench/contrib/void/browser/void.contribution.js`. |
| `product.json` | Configure le nom (`Codeen`), identifiants Windows/Mac/Linux, et liens de licence. |
| `package.json` | Scripts de build (`buildreact`, compilation avec `--max-old-space-size=8192`). |

---

## 3. Procédure de Rebase vers VS Code 1.121+
1. Créer une branche de staging : `git checkout -b rebase/vscode-1.121`.
2. Conserver `src/vs/workbench/contrib/void/` intact.
3. Réappliquer les patches minimes sur `editorGroupWatermark.ts`, `editorgroupview.css` et `workbench.common.main.ts`.
4. Mettre à jour `product.json` avec les métadonnées Codeen.
5. Lancer `npm run buildreact` puis `npm run compile`.
