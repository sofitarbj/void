# Stratégie de Comparaison avec les Codebases de Référence

## 1. Objectif

Cette stratégie encadre la manière dont le projet Codeen étudie les environnements tiers et codebases de référence (notamment **Loophole**) présents dans l'écosystème ou le workspace, afin de s'en inspirer tout en garantissant une étanchéité méthodologique et juridique totale.

---

## 2. Statut des Dépôts

- **Codeen (`e:\dev\void`)** : Projet **CIBLE EXCLUSIF**. C'est ici que s'effectuent toutes les spécifications, développements, tests et commits.
- **Loophole (`e:\dev\loophole\loophole`)** : Codebase de **RÉFÉRENCE EXTERNE (LECTURE SEULE)**.
  - Aucun fichier de Loophole ne doit être modifié, renommé ou déplacé.
  - Aucun outillage (Specify, scripts, git hooks) ne doit être installé dans Loophole.
  - Loophole sert uniquement d'oracle fonctionnel et d'étalon architectural.

---

## 3. Protocole Clean-Room (Chambre Blanche)

Pour toute fonctionnalité observée dans Loophole que Codeen souhaite intégrer (par exemple : dictée vocale locale, dashboard de tokens, écran d'accueil d'éditeur vide, CI/CD multi-plateformes) :

### Étape 1 : Analyse Fonctionnelle "Boîte Noire"
- Documenter le comportement attendu depuis la perspective utilisateur :
  - Quelle est l'interaction dans l'UI ?
  - Quelles sont les entrées et sorties observables ?
  - Quels sont les gains pour l'utilisateur ?

### Étape 2 : Spécification Neutre dans Codeen
- Créer une spécification Spec-Kit dans `specs/<NNN>-<nom>/spec.md`.
- Rédiger les exigences sans faire référence à l'implémentation privée de Loophole.
- Définir les critères d'acceptation et les tests attendus.

### Étape 3 : Conception Technique Autonome
- Élaborer un plan technique (`plan.md`) fondé sur les patterns et services propres à Codeen (`voidMemoryService`, `voidBudgetService`, etc.).
- Choisir des dépendances open-source officielles et auditées (ex: packages npm officiels sous licence MIT/Apache 2.0).

### Étape 4 : Implémentation et Validation
- Implémenter le code de façon 100% originale.
- Valider la conformité via la checklist Spec-Kit (`/speckit-checklist`).
- Enregistrer la traçabilité dans `docs/governance/PROVENANCE_AND_LICENSING.md`.
