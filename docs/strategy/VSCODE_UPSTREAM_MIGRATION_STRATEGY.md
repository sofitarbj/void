# Stratégie de Migration du Socle VS Code Amont

## 1. Contexte et Enjeux

Codeen repose actuellement sur la version **1.99.3** de Visual Studio Code (Code-OSS).
En comparaison, l'écosystème moderne (dont Loophole) opère sur **1.121.0**, représentant un différentiel de plus de 20 versions mineures.

Le passage vers un socle VS Code récent est indispensable pour :
- Bénéficier des optimisations de performances et des correctifs de sécurité récents d'Electron et de Node.js.
- Assurer la compatibilité avec les extensions récentes du Marketplace libre (Open-VSX).
- Profiter des améliorations de l'éditeur Monaco et du système de terminal intégré.

---

## 2. Principes Stratégiques de la Migration

### Principe 1 : Isolation Stricte de la Couche IA (`contrib/void`)
Pour rendre les futures montées de version prévisibles et automatisables, toute la logique spécifique à Codeen doit être confinée dans des répertoires modulaires :
- `src/vs/workbench/contrib/void/` (ou futur `codeen/`)
- Fichiers d'ancrage minimaux dans le workbench (`workbench.common.main.ts` pour l'enregistrement des contributions).
- Minimiser au strict nécessaire les modifications invasives dans le cœur de VS Code (`base/`, `editor/`, `platform/`).

### Principe 2 : Éviter le "Grand Soir" Destructif
La migration ne doit pas être tentée d'un seul bloc sans validation :
1. Stabiliser d'abord l'existant sous spécifications Spec-Kit.
2. Préparer une branche dédiée de migration (ex: `feat/upstream-migration-1.121`).
3. Appliquer la méthodologie de synchronisation sélective de la couche IA (similaire au mécanisme de synchronisation automatisée observé dans les architectures de forks industriels).

---

## 3. Feuilles de Route de la Migration

### Phase 1 : Stabilisation et Cartographie des Points d'Accroche (Préalable)
- Stabiliser et commiter les modifications actuelles de Codeen.
- Dresser la liste exacte de tous les fichiers du socle VS Code modifiés en dehors de `contrib/void/` (ex: `product.json`, `package.json`, points d'injection de menus).

### Phase 2 : Banc d'Essai sur Branche Propre
- Cloner ou rebaser le socle propre de VS Code cible (ex: tag `1.121.0`).
- Transposer les configurations de packaging et `product.json` Codeen.
- Injecter le dossier `contrib/void` stabilisé.
- Résoudre les ruptures d'APIs VS Code (breaking changes éventuels dans les interfaces de services internes).

### Phase 3 : Validation et Recette de Non-Régression
- Compilation complète (`npm run compile`).
- Compilation des composants React (`npm run buildreact`).
- Exécution de la suite de tests et smoke tests Playwright.
- Validation des scénarios clés : streaming de chat, diffs inline, outils terminal, mémoire persistante.
