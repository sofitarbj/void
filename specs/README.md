# Répertoire des Spécifications Codeen (`specs/`)

Ce dossier héberge l'ensemble des spécifications fonctionnelles et techniques pilotées par **Spec-Kit** pour le projet Codeen.

## Convention de Nommage et Structure

Chaque fonctionnalité ou chantier technique dispose de son propre répertoire numéroté :
`specs/<NNN>-<nom-court-kebab-case>/`

Exemples :
- [001-codeen-transformation-program](file:///e:/dev/void/specs/001-codeen-transformation-program/spec.md) : Programme de transformation Codeen & alignement Loophole
- [002-codeen-uiux-inventory](file:///e:/dev/void/specs/002-codeen-uiux-inventory/spec.md) : Inventaire maître UI/UX & audit de surface Codeen IDE
- [003-codeen-stitch-design-system-integration](file:///e:/dev/void/specs/003-codeen-stitch-design-system-integration/spec.md) : Intégration du Design System Stitch (Obsidian Precision) dans Codeen IDE

## Structure Standard d'une Spécification

Chaque dossier de spécification contient au minimum :
- **`spec.md`** : Spécification des exigences, user stories, critères d'acceptation et scénarios limites.
- **`plan.md`** : Plan d'implémentation technique, architecture cible, risques et phases d'exécution.
- **`tasks.md`** : Liste des tâches ordonnées et jalons d'implémentation.
- *(Optionnel)* **`research.md`** : Études préalables, benchmarks, audits de référence (clean-room).
- *(Optionnel)* **`checklists/`** : Listes de contrôle de qualité et critères de validation.

## Workflow Spec-Kit

Les commandes slash de l'agent Antigravity pour interagir avec ce dossier :
- `/speckit-specify <description>` : Génère une nouvelle spécification (`spec.md`).
- `/speckit-clarify` : Lève les ambiguïtés et clarifie les besoins non tranchés.
- `/speckit-plan` : Élabore le plan d'architecture et d'implémentation (`plan.md`).
- `/speckit-checklist` : Génère la checklist de conformité qualité.
- `/speckit-tasks` : Découpe le plan en tâches exécutables (`tasks.md`).
- `/speckit-implement` : Guide et exécute les tâches définies.
- `/speckit-converge` : Audite l'état du code et réaligne les tâches restantes.
