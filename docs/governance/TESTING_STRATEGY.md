# Stratégie de Tests et d'Assurance Qualité de Codeen

Ce document formalise la stratégie de test et de validation imposée pour garantir la robustesse et la stabilité de Codeen à chaque étape du programme.

---

## 1. Pyramide de Tests de Codeen

```text
               ▲
              / \
             /E2E\             Tests E2E & Smoke Tests (Playwright / Electron)
            /-----\
           / Intég \           Tests d'Intégration (Services VS Code & IPC)
          /---------\
         / Unitaires \         Tests Unitaires Rapides (Mocha / Node / Types)
        /-------------\
       / Hygiène & Typ \       Vérification Statique (TypeScript strict, ESLint, Layers)
      └───────────────-┘
```

---

## 2. Niveaux de Vérification

### 2.1 Niveau 0 : Hygiène et Compilation Statique (Obligatoire)
Avant toute validation de tâche ou commit :
- **Compilation TypeScript globale :**
  ```bash
  npm run compile
  ```
- **Compilation des Composants React :**
  ```bash
  npm run buildreact
  ```
- **Vérification des couches architecturales VS Code (Layers Checker) :**
  ```bash
  npm run valid-layers-check
  ```
  *Garantit qu'aucun import interdit (par exemple un import Node dans le browser) n'est introduit.*

### 2.2 Niveau 1 : Tests Unitaires Métier (`test/unit/node`)
- Cible les algorithmes purs, les analyseurs syntaxiques et les utilitaires logiques.
- Outil : Mocha (TDD mode).
- Commande :
  ```bash
  npm run test-node
  ```
- Périmètres prioritaires pour Codeen :
  - `securityUtils.ts` : validation des regex de commandes sécurisées / destructives.
  - `voidBudgetService` : calculs de quotas et compteurs de réinitialisation quotidienne.
  - `voidMemoryService` : rotation FIFO de la mémoire et parsing des Knowledge Items.
  - `prompts.ts` : formatage correct des messages système sans régression.

### 2.3 Niveau 2 : Tests d'Intégration Workbench (`test/unit/browser`)
- Cible les interactions entre services du workbench, modèles de texte Monaco et DiffZones.
- Commande :
  ```bash
  npm run test-browser-no-install
  ```

### 2.4 Niveau 3 : Smoke Tests et Tests E2E (Playwright)
- Vérifie le lancement réel de l'application Electron, l'ouverture de la fenêtre, l'affichage de la sidebar chat et la saisie de texte.
- Commande :
  ```bash
  npm run smoketest
  ```

---

## 3. Critères d'Acceptation Spec-Kit

Chaque spécification rédigée dans `specs/<NNN>-<nom>/spec.md` doit définir explicitement :
1. Les critères d'acceptation mesurables (Given / When / Then).
2. Les scénarios de tests nominaux, limites et d'erreur.
3. Les résultats de validation attendus avant de déclarer la tâche terminée.
