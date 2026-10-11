# Règles d'Implémentation de Codeen

Ce document formalise les règles techniques et méthodologiques que tout agent ou développeur doit scrupuleusement respecter lors des modifications du codebase Codeen.

---

## 1. Respect du Workflow Spec-Driven Development (Spec-Kit)

1. **Aucun code orphelin :** Toute modification structurelle ou ajout de fonctionnalité doit correspondre à une tâche formalisée dans un répertoire `specs/<NNN>-<nom>/`.
2. **Ordre strict des phases :**
   - Étape 1 : Spécification des exigences et critères d'acceptation (`spec.md`).
   - Étape 2 : Planification technique et architecture cible (`plan.md`).
   - Étape 3 : Découpage en tâches atomiques (`tasks.md`).
   - Étape 4 : Implémentation itérative avec tests et vérification de non-régression (`/speckit-implement`).
3. **Maintien du journal de tâches :** Les tâches achevées doivent être cochées au fur et à mesure dans `tasks.md`.

---

## 2. Règles d'Architecture VS Code / Electron

### 2.1 Cloisonnement des Processus
- **Processus Browser (`browser/`) :** Ne JAMAIS importer de modules Node.js natifs (`fs`, `child_process`, `crypto`, `net`) directement dans le code du navigateur. Utiliser les services VS Code abstraits (`IFileService`, `IStorageService`) ou passer par un canal IPC vers `electron-main`.
- **Processus Electron Main (`electron-main/`) :** Ne pas manipuler le DOM ni dépendre d'objets du navigateur (`window`, `document`).
- **Couche Commune (`common/`) :** Doit rester 100% agnostique de l'environnement (pas d'accès Node, ni DOM).

### 2.2 Gestion des Services VS Code (Pattern Singleton)
- Tout service partagé doit être défini par une interface décorée par `createDecorator<IService>('serviceId')` dans `common/`.
- L'implémentation concrète réside dans `browser/` ou `electron-main/`.
- L'enregistrement se fait obligatoirement via `registerSingleton(IService, ServiceImpl, InstantiationType.Delayed | Eager)` dans le fichier de contribution approprié (`void.contribution.ts`).

### 2.3 Composants React et Cycle de Vie
- Les composants React résident dans `src/vs/workbench/contrib/void/browser/react/src/`.
- Tout accès aux services VS Code depuis un composant React doit s'effectuer via le helper d'accès aux services (`services.tsx`) ou les hooks personnalisés dédiés (`useSettingsState`, `useAccessor`).
- La compilation React se fait de manière découplée via `npm run buildreact` ou `npm run watchreact`.

---

## 3. Qualité et Intégrité du Code

1. **Conservation intégrale du code :**
   - Interdiction formelle des commentaires d'omission tels que `// TODO: reste du code`, `// ...`, ou `/* code inchangé */`.
   - Tout fichier fourni ou modifié doit être complet, syntaxiquement valide et sans import manquant.
2. **Gestion rigoureuse des erreurs :**
   - Toujours typer les erreurs et prévoir des mécanismes de secours (fallback) ou d'information claire pour l'utilisateur.
   - Ne pas étouffer silencieusement les exceptions réseau ou IPC.
3. **Modifications minimales et ciblées :**
   - Ne modifier que les lignes nécessaires à la résolution de la tâche.
   - Préserver les conventions de formatage et d'indentation du fichier cible.
