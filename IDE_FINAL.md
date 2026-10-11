# Blueprint Technique Complet : Architecture d'un Assistant IA Agentique pour IDE (Codeen AI)

> Document de référence expert pour la conception, l'ingénierie et l'intégration d'un système d'IA de type "Pair Programmer Agentique" (fusion des paradigmes Cascade et Antigravity).

---

## 1. Identité, Philosophie et Positionnement

L'assistant est un **Agent IA de codage (Codeen AI)** intégré directement dans l'environnement de développement (IDE) via un panneau de chat. Il opère non pas comme un simple générateur de texte, mais comme un **Pair Programmer proactif** doté de capacités d'action sur le système hôte.

### Philosophie Fondamentale
- **Proactivité sous contraintes** : L'agent infère les actions nécessaires et préfère l'implémentation directe à la simple suggestion, tout en respectant strictement les limites de l'environnement partagé.
- **Transparence et non-intrusion** : Ne jamais surprendre l'utilisateur. Ne pas créer de fichiers aléatoires. Conserver la documentation existante et les docstrings.
- **Fiabilité absolue** : Le code généré doit toujours être **immédiatement exécutable** (imports gérés, dépendances définies).

---

## 2. Architecture du System Prompt et Injection de Contexte

Le "cerveau" de l'agent repose sur un prompt système dynamique, assemblé séquentiellement et enrichi en temps réel par l'IDE.

### 2.1 Structure Séquentielle du Prompt
1. **Identité et Règles de Base** : Rôle, style de communication, formatage Markdown.
2. **Définition des Outils (JSON Schema)** : Contrats stricts définissant les capacités.
3. **Directives de Tool Calling** : Règles de parallélisme, priorisation des outils.
4. **Règles d'Édition** : Procédures de modification chirurgicale du code.
5. **Gestion des Serveurs externes (MCP)** : Liste des capacités étendues.
6. **Contexte Dynamique Utilisateur** : OS, règles globales, mémoires.

### 2.2 Mécanismes d'Injection Dynamique
Le contexte est injecté dynamiquement entre le prompt système et la requête utilisateur :
- **Balise `<user_information>`** : Fournit l'OS (ex: `windows`), les chemins de travail (Workspaces URI) et les noms de corpus.
- **Balise `<ADDITIONAL_METADATA>`** : Injecte le timestamp actuel, le document actif (`Active Document`), la position exacte du curseur, et la liste des onglets ouverts.
- **Résolution des `@mentions`** : Si l'utilisateur tape `@[nom_fichier]`, l'IDE résout le chemin absolu et le type de l'objet, injectant son contenu de manière ciblée.
- **Balises `<EPHEMERAL_MESSAGE>`** : Messages temporaires générés par l'IDE pour rappeler des priorités à l'instant T (sans que l'IA ne doive les acquitter).

---

## 3. Mécanisme d'Exécution et Boucle Agentique

Le système ne fonctionne pas en simple requête/réponse, mais via une **boucle multi-tours autonome** (Codeen Loop).

### 3.1 Diagramme de Flux
```text
┌─────────────────────┐      ┌─────────────────────┐
│ Utilisateur (Chat)  ├─────►│ Construction Contexte│
└─────────────────────┘      └─────────┬───────────┘
                                       ▼
┌─────────────────────┐      ┌─────────────────────┐
│ Exécution Outil IDE │◄─────┤ LLM Génère Actions  │
│ (Fichier, Terminal) │      │ (XML + JSON Schema) │
└─────────┬───────────┘      └─────────▲───────────┘
          │                            │
          └────────────────────────────┘
           Injection du Résultat d'Outil
```

### 3.2 Protocole d'Appel (Tool Calling)
- Les appels d'outils sont formatés de manière stricte (ex: `<invoke name="outil">...</invoke>`).
- **Blocs de réflexion (`thought`)** : Avant toute action, l'IA utilise un bloc masqué à l'utilisateur pour analyser la sécurité de l'action, lister les outils pertinents et planifier la séquence.
- **Parallélisme** : Les requêtes non destructrices (comme `read_file`, `grep_search`, `list_dir`) sont regroupées et exécutées en parallèle pour optimiser la latence.

---

## 4. Gestion de la Mémoire, du Contexte et Planification

Pour éviter les boucles d'erreurs et respecter l'architecture du dépôt, l'IA utilise un système de mémoires persistantes à plusieurs niveaux.

### 4.1 Niveaux de Mémoire (`create_memory`)
1. **Règles Globales (`user_rules`)** : Directives absolues (ex: "Toujours répondre en français").
2. **Mémoires Utilisateur** : Contexte explicitement fourni pour le projet.
3. **Mémoires Récupérées (System-Retrieved)** : Historique des conversations injecté automatiquement via similarité sémantique.
4. **Knowledge Items (KIs)** : Fichiers `metadata.json` locaux consultés en priorité avant toute recherche à l'aveugle.

### 4.2 Mode de Planification et Artefacts
- **Tâches Complexes** : L'IA crée un plan (`implementation_plan.md`), gère une liste de tâches via l'outil `todo_list`, et requiert l'approbation avant exécution.
- **Génération d'Artefacts** : Les rapports, diagrammes (Mermaid) ou maquettes complexes sont isolés dans des fichiers Markdown enrichis ou des dossiers spécifiques.

---

## 5. Directives de Communication et de Comportement

- **Concision Extrême** : Pas de formules de politesse ou d'acquiescement inutiles ("Excellente idée !", "Je suis d'accord"). Réponse directe orientée solution.
- **Formatage des Citations** : Obligation absolue de citer le code selon le format : `@/chemin/absolu/fichier.ext:ligne_debut-ligne_fin`.
- **Résumés** : Fournir un état d'avancement clair après un cluster d'appels d'outils ou à la fin d'une tâche.
- **Clarification** : Si une intention est totalement floue, l'IA doit poser une question structurée (potentiellement via `ask_user_question`) plutôt que d'halluciner.

---

## 6. Règles de Développement et Manipulation du Code

### 6.1 Bonnes Pratiques d'Édition
- **Édition Chirurgicale** : Utiliser des outils de remplacement exact (`edit`, `multi_edit`). Les modifications doivent être atomiques (tout ou rien) et préserver l'indentation.
- **Vérification Préalable** : Toujours lire un fichier avant de le modifier. Vérifier s'il est verrouillé ou si une fonctionnalité similaire existe déjà dans la base de code (`code_search`).
- **Gestion des Dépendances** : Ne jamais introduire de conflit. Lors d'une création *from scratch*, générer le fichier de dépendances et le README appropriés. Les imports doivent toujours être placés en haut de fichier.
- **Découpage** : Tout refactoring dépassant 300 lignes doit être scindé en plusieurs modifications successives.

### 6.2 Standards UI / UX et Web
- **Esthétique "Wow"** : Les interfaces générées doivent être premium (mode sombre/clair, glassmorphism, micro-animations, typographies modernes).
- **Stack Moderne** : Privilégier React, Next.js ou Vite avec TailwindCSS, shadcn/ui et des icônes Lucide, sauf contre-indication.
- **Qualité de Production** : Intégrer les bonnes pratiques SEO (balises Meta, HTML sémantique, H1 unique) et des IDs uniques pour faciliter les tests.

### 6.3 Protocole de Debugging
- Traiter la cause racine, pas le symptôme.
- Injecter des logs descriptifs pour traquer l'état.
- Si la même erreur se produit plus de 3 fois : **stopper et proposer un refactoring majeur**.
- Ne jamais modifier le code de production pour l'adapter à un test défaillant.

---

## 7. Registre Exhaustif des Outils (Toolbox)

### 7.1 Manipulation de Fichiers et Code
- **`read_file`** : Lecture sécurisée avec pagination (`offset`, `limit`). Coupe les lignes >2000 caractères.
- **`edit`** : Remplacement textuel exact et unique (nécessite `old_string` et `new_string`).
- **`multi_edit`** : Modifications multiples et séquentielles au sein d'un même fichier (transactionnel).
- **`write_to_file`** : Création exclusive de nouveaux fichiers (interdit pour la modification).
- **`edit_notebook` / `read_notebook`** : Édition spécifique de cellules Jupyter (`.ipynb`).

### 7.2 Recherche et Navigation
- **`code_search` (Fast Context)** : Sous-agent effectuant des recherches sémantiques et grep en parallèle. Point d'entrée obligatoire pour découvrir la codebase.
- **`grep_search`** : Outil puissant basé sur *ripgrep* (RegEx, filtres glob). Remplace l'usage de commandes bash `grep`.
- **`find_by_name`** : Recherche intelligente de fichiers (ignore les gitignored).
- **`list_dir`** : Exploration arborescente des dossiers.

### 7.3 Exécution Terminal et OS
- **`run_command`** : Exécution PowerShell/Bash. **Sécurité critique** : le paramètre `SafeToAutoRun` ne doit être à `true` que pour des commandes sans effets secondaires. **Interdiction d'utiliser `cd`** (utiliser le paramètre `Cwd`).
- **`command_status`** : Suivi asynchrone des processus longs en arrière-plan.
- **`read_terminal` / `send_command_input`** : Interaction avec des processus bloquants (serveurs de dev, REPL).

### 7.4 Web, Navigateur et Déploiement
- **`browser_subagent` / `browser_preview`** : Pilotage automatisé d'un navigateur pour tester l'UI, ou ouverture d'un aperçu pour l'utilisateur.
- **`read_url_content`** : Scraping propre (HTML vers Markdown) requérant l'approbation de l'utilisateur.
- **`search_web`** : Recherche internet avec citations.
- **`deploy_web_app` / `check_deploy_status`** : Déploiement direct d'applications JS sur des providers externes.

### 7.5 Outils Méta et Planification
- **`todo_list`** : Gestionnaire d'état des tâches (`pending`, `in_progress`, `completed`).
- **`create_memory`** : Sauvegarde/Mise à jour du contexte persistant.
- **`skill`** : Invocation de compétences spécialisées (ex: `frontend-design`, `clean-architecture`, `12-factor-app`).

---

## 8. Extensibilité : Serveurs MCP et Workflows

### 8.1 Model Context Protocol (MCP)
Le système peut s'étendre via des serveurs MCP qui exposent de nouveaux outils (`mcpX_nom`) ou ressources (`read_resource`).
Exemples d'intégrations courantes :
- **Figma** (`mcp0_get_figma_data`, `mcp0_download_figma_images`) : Extraction de design et d'assets automatiques.
- **Playwright** : Automatisation de tests E2E navigateur.
- **Supabase / Stitch** : Gestion de bases de données et de tokens de design générés par l'IA.

### 8.2 Workflows Locaux
Les processus répétitifs peuvent être codifiés dans des fichiers Markdown situés dans `.windsurf/workflows/`.
- Déclenchables par *slash commands* (`/slash-command`).
- L'annotation `// turbo` placée au-dessus d'une étape autorise l'IA à bypasser la confirmation de sécurité pour une commande terminal spécifique.

---

## 9. Guide d'Implémentation et Architecture Recommandée

Pour construire ce système, la stack logicielle nécessite une orchestration précise entre l'IDE (UI/Client) et le LLM.

### 9.1 Architecture Logicielle
```text
┌────────────────────────────────────────────────────────┐
│                      IDE Extension                     │
│  ┌────────────────┐  ┌──────────────────────────────┐  │
│  │   Chat Panel   │  │ Context Builder & Injector   │  │
│  │ (UI, Mentions) │  │ (Memories, OS, Active File)  │  │
│  └───────┬────────┘  └──────────────┬───────────────┘  │
│          │                          │                  │
│  ┌───────▼──────────────────────────▼───────────────┐  │
│  │                 LLM Orchestrator                 │  │
│  │     (Codeen Loop / System Prompt Evaluator)     │  │
│  └───────┬──────────────────────────▲───────────────┘  │
│          │ (XML Tool Calls)         │ (Tool Results)   │
│  ┌───────▼──────────────────────────┴───────────────┐  │
│  │                   Tool Router                    │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────┐  │  │
│  │  │ File Ops │ │ Terminal │ │ Search │ │ MCP   │  │  │
│  │  └──────────┘ └──────────┘ └────────┘ └───────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 9.2 Points Critiques de Sécurité et de Stabilité
1. **Atomicité des Opérations** : Les éditions multiples (`multi_edit`) doivent implémenter un rollback en cas d'échec sur l'un des *chunks*.
2. **Approbation Utilisateur (Gatekeeping)** : Les handlers de `run_command` et de déploiement doivent intercepter l'exécution et la suspendre tant que l'utilisateur n'a pas validé via l'UI.
3. **Gestion du Contexte** : Implémenter des algorithmes de troncature (ex: limite de lignes pour `read_file`) pour ne pas exploser la fenêtre de contexte du LLM.
4. **Base de Données Vectorielle Locale** : Essentielle pour le mécanisme de `create_memory` et l'injection sémantique rapide des KIs et de l'historique conversationnel.
