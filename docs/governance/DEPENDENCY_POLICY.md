# Politique de Gestion des Dépendances de Codeen

Ce document régit l'ajout, la mise à jour et la suppression de dépendances logicielles (npm, Electron, Node.js, bibliothèques natives) au sein du projet Codeen.

---

## 1. Principes Directeurs

1. **Parcimonie et Légèreté :** Ne jamais introduire une dépendance externe pour une fonctionnalité pouvant être résolue élégamment par quelques lignes de TypeScript pur ou par les utilitaires natifs de VS Code (`src/vs/base/common/`).
2. **Audit de Sécurité et Maintenance :** Toute nouvelle dépendance doit être activement maintenue, auditée pour l'absence de vulnérabilités connues (CVEs) et dotée d'une gouvernance saine.
3. **Isolation des Runtimes :**
   - Les dépendances requises dans l'interface utilisateur doivent être compatibles avec le bundler React (esbuild / build.js).
   - Les modules natifs (C++ / Rust / node-gyp) ne doivent être ajoutés qu'au niveau du processus Electron et compilés pour la version exacte d'Electron utilisée par VS Code (`electron-rebuild`).

---

## 2. Politique de Licences

Codeen adhère à des règles de conformité juridique strictes :

| Statut de Licence | Licences Autorisées | Action Requise |
| :--- | :--- | :--- |
| **Autorisé sans restriction** | MIT, Apache 2.0, BSD-2-Clause, BSD-3-Clause, ISC | Mention obligatoire dans le fichier de crédits / notices de release. |
| **Sous réserve d'analyse** | LGPL-2.1, LGPL-3.0, MPL-2.0 | Vérification préalable : liaison dynamique uniquement, pas de modification du code tiers sans publication. |
| **Strictement Interdit** | GPL-2.0, GPL-3.0, AGPL-3.0, Licences Commerciales Propriétaires fermées | **Rejet automatique.** Risque de contamination virale sur l'ensemble du projet. |

---

## 3. Protocole d'Ajout d'une Nouvelle Dépendance

Avant toute exécution de `npm install <package>` :

1. **Justification Formelle :** Documenter dans la spécification ou le plan associé (`plan.md`) le besoin exact et l'alternative "sans dépendance".
2. **Vérification de Version & Conflits :**
   - Vérifier la compatibilité avec la version de Node.js et de TypeScript du projet.
   - S'assurer que le package ne provoque pas de conflits de résolution avec le `package-lock.json` de VS Code.
3. **Audit de Poids (Bundle Impact) :** Mesurer l'impact sur la taille des binaires finaux et sur le temps de démarrage du workbench.
4. **Validation dans l'Audit de Provenance :** Ajouter l'entrée correspondante dans `docs/governance/PROVENANCE_AND_LICENSING.md`.
