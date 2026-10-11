# Constitution du Projet Codeen

## Préambule

Codeen est un environnement de développement intégré natif IA (AI-native IDE), fondé sur l'architecture de Visual Studio Code (Code-OSS) et l'héritage de Void Editor, conçu pour intégrer des capacités agentiques avancées, de mémoire persistante et de contrôle de contexte.

Cette Constitution définit les principes directeurs, intangibles et non négociables régissant le développement, l'architecture, la conformité légale et les processus de décision du projet Codeen dans le cadre du pilotage par spécifications (Spec-Driven Development / Spec-Kit).

---

## Principes Fondamentaux

### I. Codeen est le Projet Cible Exclusif
Toute décision d'ingénierie, d'architecture, de style, d'outillage ou de roadmap est prise exclusivement en fonction des besoins, de la vision et des contraintes du projet Codeen.
- Les dépôts ou projets tiers (notamment Loophole) ne sont que des sources de référence externes ou d'inspiration comparative.
- Aucune contrainte spécifique à un projet de référence ne doit être imposée à Codeen si elle ne sert pas directement ses objectifs.

### II. Réimplémentation Indépendante (Clean-Room Approach)
Lorsque des projets open-source tiers (tels que Loophole ou d'autres forks de VS Code) sont consultés :
- Leurs fonctionnalités observables peuvent être étudiées et cataloguées.
- Leurs comportements, APIs utilisateur et protocoles peuvent servir à définir des exigences de parité fonctionnelle.
- Leurs architectures logiques de haut niveau peuvent être analysées.
- **Règle absolue :** Le code source d'un projet tiers ne doit JAMAIS être transplanté, copié-collé ou transposé superficiellement (simple renommage de variables, de classes ou de structures syntaxiques) dans Codeen.
- Toute fonctionnalité inspirée d'une référence doit faire l'objet d'une spécification autonome et d'une réimplémentation propre, native à l'architecture Codeen.

### III. Provenance, Traçabilité et Conformité Légale
Toute capacité technique, algorithme ou dépendance inspirée d'un projet externe doit être rigoureusement documentée :
- **Identification :** Identifier explicitement dans les documents de spécification et d'architecture la capacité recherchée et la raison de son utilité.
- **Conception :** Décrire comment Codeen conçoit et implémente cette capacité selon ses propres abstractions.
- **Dépendances & Licences :** Si des bibliothèques externes ou packages npm/crates tiers sont introduits, vérifier impérativement leur compatibilité de licence (MIT, Apache 2.0, BSD, etc.) et consigner leur provenance dans l'audit de licences.

### IV. Préservation de l'Identité et du Branding Codeen
L'identité, la marque et la vision produit de Codeen sont souveraines :
- Le nom **Codeen**, ses identifiants applicatifs (`product.json`, configurations, assets, logos) et sa terminologie doivent être strictement préservés et valorisés.
- Aucune référence à des marques ou produits tiers ne doit polluer le runtime utilisateur, les interfaces graphiques ou les métadonnées de release de Codeen.
- L'enrichissement stylistique et graphique suit la feuille de route visuelle propre à Codeen.

### V. Approche Non-Destructive et Préservation de l'Existant
Le code existant et les travaux de R&D constituent un actif précieux :
- **Interdiction des réécritures massives arbitraires :** Aucune refonte globale sans spécification validée, plan d'impact et validation préalable.
- **Non-suppression injustifiée :** Aucun composant, service ou utilitaire existant ne doit être supprimé sans justification explicite et audit d'impact de non-régression.
- **Respect du travail en cours :** Les développements locaux non encore stabilisés (services de mémoire, budget, smart context, etc.) ne doivent en aucun cas être balayés ou écrasés sous prétexte qu'ils ne sont pas présents dans un projet de référence.

### VI. Quality First & Spec-Driven Development
Aucune modification d'envergure n'est intégrée sans passer par le cycle rigoureux Spec-Kit :
1. **Spécification (`spec.md`) :** Exigences fonctionnelles, scénarios d'usage, cas limites et critères d'acceptation mesurables.
2. **Plan d'implémentation (`plan.md`) :** Découpage technique, analyse des dépendances, architecture et identification des risques.
3. **Découpage en tâches (`tasks.md`) :** Tâches atomiques, traçables et ordonnées.
4. **Vérification et Tests :** Tests automatisés (unitaires, intégration, compilation stricte) et validation manuelle des critères d'acceptation avant livraison.

---

## Gouvernance et Règles de Processus

1. **Hiérarchie des Normes :** Cette Constitution prévaut sur toutes les pratiques informelles ou décisions ad-hoc.
2. **Modification de la Constitution :** Tout amendement à cette Constitution doit être explicitement documenté avec justification technique, analyse d'impact et validation du Lead Architect.
3. **Revue de Conformité :** Chaque pull request ou phase de spécification doit valider le respect des principes fondamentaux (notamment la réimplémentation indépendante et la non-destructivité).

**Version**: 1.0.0 | **Ratifiée**: 2026-10-08 | **Dernière modification**: 2026-10-08
