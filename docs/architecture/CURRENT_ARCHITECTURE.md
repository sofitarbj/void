# Architecture Actuelle de Codeen

## 1. Vue d'Ensemble du Système

Codeen est structuré comme un fork direct de Visual Studio Code (Code-OSS v1.99.3). L'architecture repose sur le modèle de processus d'Electron :

```text
┌─────────────────────────────────────────────────────────────┐
│                 Processus Electron Principal                │
│                      (electron-main)                        │
│  - Gestion du cycle de vie de la fenêtre                    │
│  - Services natifs Node.js (accès fichiers bas niveau)      │
│  - sendLLMMessage (Appels API LLM directs aux providers)    │
└──────────────────────────────▲──────────────────────────────┘
                               │ IPC (Canaux sécurisés)
┌──────────────────────────────▼──────────────────────────────┐
│                Processus de Rendu Workbench                 │
│                          (browser)                          │
│  - Moteur Monaco Editor (TextModels, DiffZones, SCM)        │
│  - Services du Workbench VS Code (@Services injectés)       │
│  - Couche Agentique (chatThreadService, toolsService, etc.) │
│  - Composants React embarqués (SidebarChat, QuickEdit, etc.)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Découpage des Processus

### 2.1 Processus `electron-main`
- Situé dans `src/vs/workbench/contrib/void/electron-main/`.
- Rôle central : exécuter les appels réseau sortants vers les APIs des fournisseurs d'IA via `sendLLMMessage.impl.ts`.
- **Justification architecturale :** Évite les restrictions de Content Security Policy (CSP) imposées au processus de rendu du navigateur et permet d'utiliser directement les modules de transport réseau de Node.js.

### 2.2 Processus `browser` (Workbench & UI)
- Situé dans `src/vs/workbench/contrib/void/browser/`.
- Enregistrement des services singleton VS Code via `void.contribution.ts` :
  - `IChatThreadService` : Orchestration de la boucle conversationnelle et exécution des requêtes.
  - `IToolsService` : Déclaration et invocation des outils disponibles pour l'agent (fichiers, terminal, recherche, etc.).
  - `IVoidModelService` / `IEditCodeService` : Application des modifications de code dans les modèles de texte de l'éditeur (Fast Apply avec Search/Replace, DiffZones visuelles).
  - `IVoidMemoryService` : Gestion de la mémoire persistante locale et Knowledge Items (en cours de stabilisation).
  - `IVoidBudgetService` : Calcul et plafonnement des coûts et quotas de tokens.
  - `ISmartContextService` / `IModelRouterService` : Sélection intelligente de contexte et routage de requêtes.

### 2.3 Couche Commune (`common`)
- Située dans `src/vs/workbench/contrib/void/common/`.
- Contient les interfaces de contrats de service, les types de messages, les énumérations de modèles supportés (`modelCapabilities.ts`) et les utilitaires partagés (`securityUtils.ts`).
- Code pur, indépendant des APIs spécifiques du DOM ou de Node.js.

### 2.4 Interface Utilisateur Réactive (`browser/react`)
- Composants React compilés séparément via `node build.js` (script `npm run buildreact`).
- Écran principal : `SidebarChat.tsx` (sidebar interactive intégrant chat, sélection de modèle, progression de tâche, saisie vocale et documents système).
- Boîtes de dialogue secondaires : `QuickEdit.tsx` (édition inline dans l'éditeur de code), `Settings.tsx` (panneau de configuration des clés API et options des providers).

---

## 3. Pipeline d'Exécution d'une Requête IA

1. **Saisie Utilisateur :** L'utilisateur soumet une requête via `SidebarChat` ou le raccourci `QuickEdit`.
2. **Construction du Contexte (`convertToLLMMessageService`) :**
   - Collecte de l'historique de la conversation.
   - Injection des fichiers référencés et de la sélection de code active.
   - Injection des instructions système, règles utilisateur (`user_rules`) et mémoire persistante (`persistent_context`).
3. **Vérification Budgétaire & Sécurité :**
   - Contrôle du quota journalier par `voidBudgetService`.
4. **Appel IPC vers `electron-main` :**
   - Envoi de la requête au canal IPC `void-sendLLMMessage`.
5. **Streaming de la Réponse :**
   - Réception des chunks textuels ou des appels d'outils (`tool_calls`).
   - Notification réactive de l'interface utilisateur.
6. **Exécution d'Outils & Application (`toolsService` / `editCodeService`) :**
   - Si l'agent invoque un outil terminal : classification de sécurité (`securityUtils.ts`).
   - Si l'agent génère un bloc de modification de code : application via Search/Replace dans le modèle de texte avec affichage d'un DiffZone interactif.
