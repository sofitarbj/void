# Plan d'Architecture & Stratégie de Refonte UI/UX : Codeen IDE

## 1. Contexte et Frontières Techniques

Codeen est un IDE bâti sur un fork de VS Code 1.99.3. Pour garantir la longévité, la performance et la compatibilité totale avec les extensions du Marketplace, toute évolution du design doit suivre une **stratégie en couches étanches**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        COUCHES D'INTERFACE CODEEN                      │
├────────────────────────────────────────────────────────────────────────┤
│ COUCHE 1 : DESIGN SYSTEM & IDENTITÉ CODEEN (React, Tailwind, SVG)     │
│   • Onboarding Overlay (VoidOnboarding)                                │
│   • Empty Editor Home (EmptyEditorHome)                                │
│   • Chat & Agent Panel (SidebarChat, VoidChatArea, Messages)           │
│   • Quick Edit Widget (QuickEditChat)                                  │
│   • Fast Apply Controls (VoidCommandBar, CommandBarInChat)             │
│   • Settings Hub & Token Dashboard (Settings, TokenUsageDialog)        │
├────────────────────────────────────────────────────────────────────────┤
│ COUCHE 2 : THÈME & TOKENS WORKBENCH (CSS Variables & Theme JSON)       │
│   • Variables de thème (--vscode-*, color-mix, tokens syntaxiques)     │
│   • Pont CSS d'isolation (styles.css, void.css)                        │
│   • Title Bar, Status Bar, Activity Bar, Tabs, Splitters, Gutters      │
├────────────────────────────────────────────────────────────────────────┤
│ COUCHE 3 : WORKBENCH SHELL & EXTENSION HOST (VS Code Core Natif)       │
│   • Monaco Editor Core (TextBuffer, Tokenizer, Cursors, Minimap)       │
│   • File Service, TextMate Grammars, Language Server Protocol (LSP)    │
│   • SCM / Git Provider, Terminal PTY, Debugger Core                    │
│   → INTERDICTION FORMELLE DE MODIFIER OU DE RÉÉCRIRE CETTE COUCHE      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Paliers d'Exécution de la Future Refonte

### Phase 1 : Système de Tokens & Palette Maître (Niveau 1 — Thème)
* **Objectif** : Remplacer les couleurs disparates par un jeu de tokens harmonieux inspiré des standards modernes (Apple Developer Tools, Linear, OpenAI).
* **Actions** :
  1. Définir une palette sémantique dans les thèmes Codeen (`Codeen Dark Modern`, `Codeen Light Modern`).
  2. Aligner les variables `--void-*` dans `styles.css` directement sur ces tokens pour que tous les composants React adoptent la nouvelle ambiance sans toucher au code métier.

### Phase 2 : Refonte des Écrans Phares (Niveau 3 — Composants React)
* **Objectif** : Offrir un impact visuel immédiat dès l'onboarding et l'ouverture de l'IDE.
* **Composants ciblés** :
  - **Onboarding** : Stepper épuré, typographie premium, transition fluide vers le workspace.
  - **Empty Editor Home** : Hub d'accueil moderne avec accès rapide aux projets récents, modèles actifs et actions IA.
  - **Chat Panel & Input Bar** : Simplification des bordures, typographie soignée, badges d'outils plus discrets.

### Phase 3 : Harmonisation de l'Expérience Agentique In-Editor
* **Objectif** : Unifier visuellement les widgets flottants (Quick Edit `Ctrl+K`, Fast Apply Command Bar, Selection Helper).
* **Actions** :
  - Harmoniser le style des boutons Accept/Reject.
  - Supprimer le bruit visuel dans les diffs en temps réel.
  - Rendre les blocs "Thinking" et "Tool Execution" pliables et compacts par défaut.

---

## 3. Ce qui Doit Rester 100% Natif (Garde-fous)

Pour préserver la stabilité absolue et éviter toute dette technique ingérable :
1. **Moteur d'édition Monaco** : Ne jamais toucher aux mécanismes internes de layout, au buffer de texte ou au scrolling virtuel.
2. **Gestionnaire de fichiers et Explorateur** : L'arbre de fichiers et ses context menus natifs doivent rester orchestrés par VS Code.
3. **Moteur de Terminal** : Xterm.js et la gestion PTY ne doivent être modifiés que par le biais des options de thème VS Code.
4. **Extension Host** : Les extensions tierces doivent s'exécuter dans un environnement standard et prévisible.
