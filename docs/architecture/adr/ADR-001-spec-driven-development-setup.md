# ADR-001 : Adoption du Pilotage par Spécifications (Spec-Kit / Specify)

- **Statut** : Accepté
- **Date** : 2026-10-08
- **Auteurs** : Software Architect & Spec-Driven Development Lead
- **Contexte** : Transformation de Codeen en IDE IA autonome et professionnel

---

## 1. Contexte et Problématique

Le projet Codeen a accumulé une série de développements expérimentaux non commités et de plans de travail informels (`task.md`, divers fichiers markdown de roadmap), tout en devant se confronter à l'évolution rapide des technologies d'IDE natifs IA et à la comparaison avec des codebases de référence industrielles (telles que Loophole).

Sans cadre méthodologique rigoureux, le risque est élevé :
- de dérive fonctionnelle ou d'incohérence architecturale ;
- de régression sur le code existant ou sur le socle VS Code ;
- de violation de propriété intellectuelle par copie non maîtrisée de projets tiers ;
- de perte de traçabilité entre les besoins métier, la conception technique et le code implémenté.

---

## 2. Décision

Il est décidé d'adopter formellement la méthodologie **Spec-Driven Development (SDD)** outillée par **GitHub Spec Kit (`specify`)** :

1. **Intégration d'outillage :**
   - Initialisation de Spec-Kit dans le dépôt Codeen (`.specify/`) avec l'intégration agent `agy` (Google Antigravity).
   - Scripts d'automatisation PowerShell natifs (`.specify/scripts/powershell/`).
   - Compétences d'agent dédiées dans `.agents/skills/` (`speckit-specify`, `speckit-plan`, `speckit-tasks`, `speckit-implement`, `speckit-constitution`, etc.).

2. **Constitution Non-Négociable :**
   - Rédaction et ratification de la Constitution Codeen dans `.specify/memory/constitution.md`, définissant notamment le principe de réimplémentation indépendante (clean-room), la non-destructivité et la primauté de la qualité.

3. **Cycle de Développement Imposé :**
   - Aucune fonctionnalité majeure ne sera codée directement sans une spécification validée dans `specs/<NNN>-<nom>/spec.md`, un plan d'architecture (`plan.md`) et un découpage en tâches (`tasks.md`).

---

## 3. Conséquences

### Positives
- **Traçabilité totale :** Chaque modification de code est rattachée à une tâche, un plan et une exigence formalisée.
- **Sécurité juridique & technique :** L'approche clean-room prévient toute contamination de licence ou transplantation illégale de code tiers.
- **Collaboration fluide :** Les agents d'IA et les développeurs humains partagent une source de vérité documentaire claire.

### Négatives / Contraintes
- **Rigueur initiale obligatoire :** Nécessite une phase de rédaction de spécifications avant tout codage effectif.
- **Maintien de la documentation :** Obligation de synchroniser les plans et les tâches lors des ajustements d'implémentation.
