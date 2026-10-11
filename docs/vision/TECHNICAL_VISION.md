# Vision Technique de Codeen

## 1. Ambition du Produit

**Codeen** est conçu pour être un IDE natif pour l'intelligence artificielle (AI-native IDE), offrant aux ingénieurs logiciels un environnement de travail augmentant drastiquement leur productivité tout en garantissant une maîtrise absolue du contexte, des coûts, de la confidentialité et de la sécurité des opérations.

À la différence d'un simple éditeur de texte augmenté d'une extension de chat, Codeen intègre l'intelligence artificielle au cœur même de son architecture d'ingénierie logicielle (processus Electron, système de fichiers, services du workbench, terminal et gestionnaire de code source).

---

## 2. Piliers Stratégiques

### Pilier 1 : Autonomie Agentique Supervisée (Agentic Loop)
- Capacité d'exécuter des workflows complexes en plusieurs étapes : planification préalable (`implementation_plan.md`), suivi dynamique (`task.md`), inspection d'outils, édition multi-fichiers, vérification par compilation/tests, et validation finale.
- Garde-fous de sécurité avec classification des commandes terminal (safe, moderate, destructive) et mécanismes d'auto-approbation conditionnels.

### Pilier 2 : Mémoire Persistante & Knowledge Items (KI)
- Maintien d'un contexte persistant inter-sessions au niveau du projet et de l'utilisateur.
- Conservation d'enseignements architecturaux, de règles spécifiques et de résumés de session compacts pour éliminer l'amnésie des agents conversationnels sans saturer la fenêtre de contexte.

### Pilier 3 : Gestion Budgétaire et Smart Context
- Optimisation fine des coûts et des tokens consommés : routage dynamique des modèles (petits modèles rapides pour les tâches d'extraction/outils, modèles frontières pour le raisonnement complexe).
- Contrôle strict des quotas quotidiens, fallback automatique entre fournisseurs LLM (OpenAI, Anthropic, Gemini, Groq, Ollama, vLLM, LM Studio) et budget tracker intégré.

### Pilier 4 : Respect de la Confidentialité et Souveraineté des Données
- Architecture de communication directe (Peer-to-Provider) : les requêtes IA partent directement de la machine de l'utilisateur vers le fournisseur choisi, sans serveur intermédiaire opaque hébergé par un tiers.
- Support des runtimes et modèles locaux (Ollama, vLLM, LM Studio, et à terme Transformers locaux).

### Pilier 5 : Expérience Développeur Premium
- Interface utilisateur réactive, soignée et moderne, bâtie sur le socle éprouvé de VS Code.
- Outils intégrés de diff inline fluide, édition rapide (Quick Edit), barre de commande unifiée et dashboard d'accueil contextuel.

---

## 3. Positionnement Vis-à-vis des Références (Void, Loophole)

- **Héritage Void :** Codeen s'appuie sur les fondations ouvertes de Void pour l'intégration de la couche IA (`src/vs/workbench/contrib/void`) et la passerelle IPC entre le processus principal Electron (`electron-main`) et le workbench (`browser`).
- **Benchmark Loophole :** Loophole représente un modèle d'industrialisation avancé (socle VS Code 1.121.0, chaîne de packaging multi-plateformes, runtime voix local, gestion fine des versions). Codeen étudie les fonctionnalités observables de Loophole pour viser une parité fonctionnelle et de robustesse, tout en conservant son indépendance totale de code et sa propre vision agentique avancée.
