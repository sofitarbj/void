# Dette Technique Connue de Codeen

Ce document répertorie les sources de dette technique identifiées lors de l'audit initial, classées par criticité, afin d'alimenter les futurs chantiers de spécification.

---

## 1. Dette Critique (P0)

### 1.1 Retard du Socle VS Code Amont (Base 1.99.3)
- **Constat** : Le codebase Codeen est ancré sur VS Code v1.99.3. En comparaison, les projets récents (comme Loophole) opèrent sur VS Code v1.121.0 (soit plus de 20 versions mineures d'écart).
- **Conséquences** :
  - Absence des dernières fonctionnalités de Monaco Editor, de l'accessibilité et de l'optimisation mémoire.
  - Incompatibilité potentielle avec des extensions récentes de l'écosystème VS Code.
  - Dette d'obsolescence croissante vis-à-vis des versions de Node.js et Electron sous-jacentes.
- **Action requise** : Définir une spécification dédiée à la stratégie de rebase ou de synchronisation vers un socle VS Code moderne (ex: 1.116 ou 1.121).

### 1.2 Dossier Dupliqué Fantôme dans l'UI (`browser/react/src2/`)
- **Constat** : Présence d'un sous-dossier `src/vs/workbench/contrib/void/browser/react/src2/` contenant 44 fichiers dupliqués de composants React.
- **Conséquences** :
  - Risque élevé de confusion lors des modifications de code ou de maintenance par les agents ou développeurs.
  - Poids superflu et pollution de l'arborescence.
- **Action requise** : Auditer les éventuelles spécificités de `src2`, consolider les éléments utiles dans `src/`, puis formaliser la suppression propre de `src2/` sous le contrôle d'une spécification.

---

## 2. Dette Majeure (P1)

### 2.1 Absence de Chaîne CI/CD et d'Industrialisation de Build
- **Constat** : Le répertoire `.github/workflows/` ne comporte qu'un unique script `triage.yml`. Aucun workflow de compilation continue (Linux, Windows, macOS), de packaging binaire (.exe, .dmg, .deb, .rpm), ni de smoke testing n'est en place.
- **Conséquences** :
  - Incapacité actuelle à distribuer facilement des versions autonomes de Codeen aux utilisateurs finaux.
  - Détection tardive des erreurs de compilation ou de régression multi-plateformes.
- **Action requise** : Spécifier et concevoir une suite CI/CD complète inspirée des meilleures pratiques industrielles (matrice de build GitHub Actions, publication d'artefacts, auto-update).

### 2.2 Volume Important de Code Non Commité / Non Intégré
- **Constat** : 31 fichiers modifiés et 32 fichiers untracked représentent plus de 2 700 lignes de diffs suspendues sur la branche `sofitar-update`.
- **Conséquences** :
  - Fragilité du workspace vis-à-vis d'opérations Git involontaires.
  - Difficulté à valider l'intégrité de la suite de tests unitaires existante.
- **Action requise** : Stabiliser chaque lot fonctionnel sous forme de spécification Spec-Kit, valider la compilation, et consolider par commits atomiques documentés.

---

## 3. Dette Modérée (P2)

### 3.1 Hétérogénéité de la Nomenclature et du Branding
- **Constat** : Le produit est nommé "Codeen" dans `product.json`, mais l'arborescence des fichiers, les namespaces de services et les identifiants d'actions utilisent quasi exclusivement le préfixe `void` (`src/vs/workbench/contrib/void/`, `IVoidMemoryService`, `voidCommandBar`, etc.).
- **Conséquences** :
  - Dissonance cognitive dans le code.
- **Action requise** : Ne pas effectuer de renommage brutal et prématuré sans plan. Planifier une phase de transition progressive et non-destructive vers les namespaces `codeen`.

### 3.2 Couverture de Tests pour les Services IA
- **Constat** : Les services agentiques avancés (`chatThreadService`, `toolsService`, `voidBudgetService`, `voidMemoryService`) ne disposent pas d'une suite de tests unitaires et de mocks automatisés suffisante.
- **Action requise** : Mettre en place des tests automatisés (Mocha / TDD) vérifiant les contrats d'interface, la classification sécuritaire des commandes et le plafonnement budgétaire.
