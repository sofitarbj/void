# Politique de Provenance et Registre des Licences

## 1. Cadre de Provenance et Approche Clean-Room

Le projet Codeen s'inspire des meilleurs concepts d'IDE natifs IA existants (notamment Void, Loophole et Antigravity) tout en garantissant une étanchéité absolue de propriété intellectuelle.

### 1.1 Règle de Non-Transplantation
- Il est strictement prohibé de copier des blocs de code source depuis un projet de référence externe (tel que Loophole ou Cursor) vers Codeen.
- Le simple fait de renommer des classes, variables, styles CSS ou structures de données ne constitue en rien une réimplémentation indépendante.

### 1.2 Méthodologie d'Analyse Autorisée
1. **Étude Fonctionnelle Externe :** Observer les interfaces, comportements, entrées/sorties et capacités visibles d'un outil de référence.
2. **Spécification Abstraite :** Rédiger une spécification dans Codeen décrivant le besoin métier et les cas d'usage attendus.
3. **Implémentation Indépendante :** Concevoir une architecture et une implémentation TypeScript originales, directement intégrées au modèle de services de Codeen.

---

## 2. Registre de Provenance des Capacités

Chaque capacité majeure inspirée d'un benchmark externe doit être répertoriée dans le tableau suivant :

| ID Capacité | Fonctionnalité Recherchée | Projet d'Inspiration | Motivation / Justification | Mode de Réalisation Codeen | Dépendances & Licences |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CAP-001** | Passerelle LLM & Fast Apply Diff | Void Editor | Base historique de l'IDE pour l'interaction modèle et l'application Search/Replace inline. | Fork initial sous licence Apache 2.0 / MIT. | `src/vs/workbench/contrib/void` (Apache-2.0 / MIT) |
| **CAP-002** | Mémoire Persistante & Knowledge Items | Google Antigravity / R&D Codeen | Élimination de l'amnésie des agents et maintien du contexte architectural sans surcharge de tokens. | Conception originale native VS Code StorageService (`IVoidMemoryService`). | Aucune dépendance externe. 100% Codeen. |
| **CAP-003** | Budget API & Garde-fous Terminal | R&D Codeen / Best Practices | Prévention des dérives financières et sécurisation de l'exécution automatique des commandes système. | Conception originale (`securityUtils.ts`, `IVoidBudgetService`). | Moteur Regex interne. 100% Codeen. |
| **CAP-004** | Dictée Vocale Locale (Zero-Cloud) | Loophole (Capacité observable) | Permettre la dictée vocale sans dépendance à une API cloud et dans le respect total de la vie privée. | Spécification future dans `specs/`. Réimplémentation via pipeline Transformers.js / ONNX sous licence permissive. | À évaluer (ONNX Runtime Web / Transformers.js sous Apache-2.0). |
| **CAP-005** | Suivi Visuel de Tokens & Heatmap | Loophole (Capacité observable) | Fournir au développeur un retour visuel direct sur sa consommation de jetons et son activité. | Spécification future dans `specs/`. Composant React original connecté à `IVoidBudgetService`. | Tokenizer natif (ex: tiktoken sous MIT). |
| **CAP-006** | Écran d'Accueil Empty Editor | Loophole / VS Code Welcome | Améliorer l'expérience d'accueil et fournir des raccourcis rapides quand aucun fichier n'est ouvert. | Spécification future dans `specs/`. Composant React intégré au workbench Codeen. | 100% Codeen. |

---

## 3. Audit des Licences des Dépendances Externes

Toutes les dépendances intégrées au projet Codeen font l'objet d'un audit de licence semestriel. Toute dépendance détectée avec une licence incompatible avec le modèle de distribution de Codeen sera immédiatement signalée et retirée.
