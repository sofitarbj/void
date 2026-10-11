# PROMPT — INTÉGRATION DU DESIGN STITCH DANS CODEEN

```text
# CODEEN — DESIGN IMPLEMENTATION & WORKBENCH INTEGRATION

## RÔLE

Tu es maintenant :

- Principal Frontend Engineer,
- Senior TypeScript Engineer,
- VS Code / Workbench Architect,
- Electron UI Engineer,
- React Engineer,
- Design Systems Engineer,
- UX Implementation Specialist.

Ta mission est de transformer le nouveau design visuel de Codeen, produit sous forme de fichiers HTML/CSS/SVG et organisé dans un dossier dédié, en une implémentation réelle, native et maintenable dans le codebase Codeen.

Tu ne dois PAS simplement reproduire les maquettes dans une page web au-dessus de VS Code.

Tu dois intégrer réellement ce nouveau langage visuel dans l'architecture de Codeen.

---

# 1. CONTEXTE

Le projet cible est :

# CODEEN

Codeen est un fork de Void / VS Code.

Le produit possède déjà :

- le Workbench VS Code ;
- Monaco ;
- l'éditeur ;
- Explorer ;
- Search ;
- Source Control ;
- Terminal ;
- Problems ;
- Settings ;
- Activity Bar ;
- Sidebars ;
- Auxiliary Bar ;
- Status Bar ;
- menus ;
- Quick Pick ;
- Command Palette ;
- contributions Codeen ;
- composants React Codeen ;
- Chat ;
- Agent ;
- Quick Edit ;
- Fast Apply ;
- MCP ;
- etc.

Une phase précédente a permis de créer un inventaire fonctionnel complet de la surface UI/UX de Codeen.

Une autre phase a permis de créer un nouveau Design System Codeen et les maquettes des écrans correspondants.

La mission actuelle est :

> transformer ce design en véritable interface Codeen fonctionnelle.

---

# 2. RESSOURCES DISPONIBLES DANS LE WORKSPACE

Dans le workspace, tu disposes notamment de :

## A. CODEBASE CODEEN

Le dépôt complet Codeen.

C'est le SEUL dépôt que tu dois modifier.

---

## B. DOSSIER DESIGN CODEEN

Un dossier contient les designs générés pour Codeen.

Sa structure ressemble à :

```text
/codeen-design/
    /design-system/
        ...
    /onboarding-welcome/
        ...
    /onboarding-providers/
        ...
    /onboarding-theme/
        ...
    /onboarding-import/
        ...
    /empty-editor/
        ...
    /chat-landing/
        ...
    /chat-conversation/
        ...
    /chat-thinking/
        ...
    /tool-call-edit/
        ...
    /tool-call-terminal/
        ...
    /fast-apply/
        ...
    /quick-edit/
        ...
    /settings/
        ...
    /token-dashboard/
        ...
    ...
```

Les noms réels des dossiers doivent être détectés automatiquement.

Chaque dossier peut contenir :

- HTML ;
- CSS ;
- JavaScript ;
- SVG ;
- images ;
- fonts ;
- assets ;
- variantes ;
- captures ;
- autres fichiers produits par l'outil de design.

---

## C. CODEEN UI/UX MASTER INVENTORY

Un document d'inventaire UI/UX est également fourni.

Il constitue le CONTRAT FONCTIONNEL.

Il décrit notamment :

- les écrans ;
- les vues ;
- les composants ;
- les états ;
- les interactions ;
- les parcours ;
- l'origine technique ;
- les niveaux de personnalisation ;
- les priorités ;
- les éléments à préserver.

Ce document ne doit pas être remplacé par les maquettes.

Il doit être utilisé avec elles.

---

# 3. HIÉRARCHIE DES SOURCES DE VÉRITÉ

Pour éviter toute confusion, utilise cette hiérarchie :

## 1 — CODEBASE ACTUEL

Détermine :

- ce qui existe réellement ;
- où cela existe ;
- comment cela fonctionne ;
- quelles contraintes techniques existent.

## 2 — UI/UX MASTER INVENTORY

Détermine :

- ce que chaque écran doit faire ;
- quelles interactions existent ;
- quels états existent ;
- quelles fonctionnalités doivent être conservées.

## 3 — DESIGN SYSTEM

Détermine :

- couleurs ;
- tokens ;
- typographie ;
- spacing ;
- radius ;
- composants ;
- iconographie ;
- motion ;
- règles visuelles.

## 4 — MAQUETTES HTML/CSS

Déterminent :

- composition visuelle ;
- hiérarchie ;
- placement ;
- proportions ;
- comportement visuel ;
- apparence ;
- détails du design.

Les maquettes ne doivent jamais remplacer l'architecture réelle de Codeen.

---

# 4. OBJECTIF

L'objectif final est :

> Faire de Codeen la véritable version fonctionnelle des interfaces conçues dans le dossier Design.

Je veux que lorsqu'un utilisateur ouvre Codeen, il retrouve réellement :

- la nouvelle identité ;
- les nouveaux composants ;
- les nouvelles surfaces ;
- les nouveaux états ;
- les nouveaux comportements visuels ;
- la nouvelle expérience AI ;
- le nouveau langage d'interaction.

Mais sous le capot :

- VS Code reste VS Code ;
- Monaco reste Monaco ;
- le Workbench reste le Workbench ;
- les mécanismes natifs restent utilisés lorsque cela est pertinent ;
- les extensions doivent continuer à fonctionner ;
- les raccourcis doivent continuer à fonctionner ;
- les comportements développeur doivent rester cohérents.

---

# 5. RÈGLE ABSOLUE

NE CONSTRUIS PAS UNE FAUSSE APPLICATION PAR-DESSUS CODEEN.

Je ne veux PAS :

```text
VS Code
+
gros HTML overlay
+
application parallèle
```

Je veux :

```text
VS Code Workbench
        +
Codeen Design System
        +
Codeen Contributions
        +
React Codeen Components
        +
Theme Tokens
        +
Native Workbench Customization
        +
Monaco Widgets
```

Chaque élément doit être placé à son niveau architectural approprié.

---

# 6. PREMIÈRE PHASE — AUDIT DU DOSSIER DESIGN

Avant toute modification :

inspecte intégralement le dossier de design.

Identifie automatiquement :

- le dossier Design System ;
- tous les dossiers de pages ;
- tous les fichiers HTML ;
- tous les CSS ;
- tous les SVG ;
- tous les assets ;
- toutes les variantes d'écran ;
- toutes les ressources partagées.

Construis un inventaire :

| Design Folder | Écran | Fichiers | Variante | Correspondance Inventory | Surface Codeen | État |
|---|---|---|---|---|---|---|

Ne commence pas immédiatement à coder.

---

# 7. DEUXIÈME PHASE — MAPPING DESIGN → CODEEN

Pour chaque écran du dossier design :

1. identifie son équivalent dans le Master Inventory ;
2. retrouve le composant ou service actuel dans Codeen ;
3. retrouve le point d'entrée Workbench ;
4. retrouve les fichiers responsables ;
5. détermine comment le nouveau design doit être intégré.

Par exemple :

```text
Design:
chat-conversation/

Inventory:
SCR-07

Codeen actuel:
SidebarChat.tsx

Workbench:
SidebarViewPane

Implementation target:
Codeen Chat React component
inside native Auxiliary Bar
```

Construis cette cartographie pour TOUTES les surfaces.

---

# 8. NE PAS RÉÉCRIRE TOUT CODEEN

N'effectue pas automatiquement une réécriture massive.

Pour chaque surface, détermine d'abord :

### CASE A — EXISTING CODEEN COMPONENT

Le composant existe déjà.

→ améliorer/refactorer ce composant.

### CASE B — NATIVE VS CODE COMPONENT

L'élément appartient au Workbench.

→ personnaliser le mécanisme natif.

### CASE C — VS CODE THEME SURFACE

L'apparence peut être obtenue via theme tokens.

→ utiliser les tokens.

### CASE D — NEW CODEEN COMPONENT

La surface n'existe pas.

→ créer un composant Codeen propre.

### CASE E — MONACO WIDGET

L'élément doit vivre dans l'éditeur.

→ utiliser les mécanismes Monaco / ZoneWidget / OverlayWidget appropriés.

### CASE F — SERVICE + UI

L'interface dépend d'un état métier.

→ conserver/adapter le service existant.

---

# 9. DESIGN SYSTEM — SOURCE COMMUNE

Le dossier :

```text
design-system/
```

est extrêmement important.

Avant d'implémenter les écrans individuellement, analyse son contenu.

Identifie :

- couleurs ;
- semantic tokens ;
- backgrounds ;
- surfaces ;
- borders ;
- foregrounds ;
- typography;
- font sizes ;
- font weights ;
- spacing ;
- radius ;
- shadows ;
- icon sizes ;
- button variants ;
- input variants ;
- states ;
- animations ;
- transitions.

Construis ensuite une correspondance entre le Design System et l'architecture Codeen.

---

# 10. INTÉGRATION DES TOKENS

Lorsque c'est possible, ne hardcode pas les valeurs directement dans chaque composant.

Construis une couche de tokens cohérente.

Par exemple :

```css
--codeen-bg-primary
--codeen-bg-secondary
--codeen-bg-surface
--codeen-bg-elevated

--codeen-fg-primary
--codeen-fg-secondary
--codeen-fg-muted

--codeen-border
--codeen-border-subtle

--codeen-accent
--codeen-accent-hover

--codeen-success
--codeen-warning
--codeen-error
```

Mais adapte les noms à l'architecture réelle du projet.

---

# 11. INTÉGRATION AVEC VS CODE THEME TOKENS

Lorsque la surface est native VS Code, utilise prioritairement les mécanismes du thème.

Examine les variables :

```text
--vscode-*
```

et les abstractions déjà présentes dans Codeen.

Le design system Codeen doit être capable de s'exprimer au travers du système de thème lorsque cela est raisonnablement possible.

Ne crée pas des couleurs entièrement parallèles dans tous les composants sans nécessité.

Le but est de conserver une relation propre entre :

```text
VS Code Theme
      ↓
Codeen Tokens
      ↓
Codeen Components
```

---

# 12. OUTFIT

La typographie de marque Codeen est :

# Outfit

Utilise Outfit là où cela est techniquement approprié.

Priorités :

- branding ;
- onboarding ;
- home ;
- Codeen UI ;
- Chat ;
- Settings Codeen ;
- dashboards ;
- Codeen-owned components.

Ne remplace pas aveuglément la typographie native de tout le Workbench si cela risque de créer des problèmes de compatibilité ou de maintenance.

Le principe est :

> utiliser Outfit pour donner sa personnalité à Codeen, sans combattre inutilement les mécanismes natifs du système.

---

# 13. LOGO CODEEN

Le logo Codeen fourni dans les ressources de design est la source de vérité.

Utilise :

- la version SVG ;
- la version HTML/CSS lorsque nécessaire ;
- les variantes présentes dans le Design System.

Ne recrée pas le logo différemment.

Ne remplace pas le logo par un autre symbole.

Le logo doit être intégré dans les surfaces pertinentes :

- onboarding ;
- home ;
- Codeen views ;
- loading si nécessaire ;
- branding.

Évite néanmoins de l'afficher partout.

---

# 14. HTML/CSS DES MAQUETTES = RÉFÉRENCE VISUELLE

Les fichiers HTML/CSS générés par Stitch ne doivent pas être simplement copiés dans Codeen.

Ils constituent une référence de :

- layout ;
- spacing ;
- dimension ;
- structure visuelle ;
- responsive behavior ;
- interactions ;
- style.

Tu dois convertir cette structure en véritable architecture Codeen.

Exemple :

MAQUETTE :

```html
<div class="chat-panel">
   ...
</div>
```

Ne fais pas nécessairement :

```text
copier HTML → injecter dans VS Code
```

Tu dois déterminer :

```text
ChatPanel design
↓
SidebarChat.tsx
↓
Codeen Chat component architecture
↓
native Auxiliary Bar
```

---

# 15. RÈGLE DE RÉUTILISATION

Cherche toujours les composants déjà existants dans Codeen avant d'en créer un nouveau.

Par exemple :

si plusieurs écrans utilisent le même :

- Button ;
- IconButton ;
- Dropdown ;
- Input ;
- Badge ;
- Panel ;
- Tooltip ;

crée ou utilise un composant partagé.

Ne crée pas :

```text
ButtonA
ButtonB
ButtonC
ButtonD
```

avec quatre implémentations presque identiques.

---

# 16. COMPOSANTS PARTAGÉS CODEEN

Construis progressivement une véritable bibliothèque interne Codeen pour les composants qui sont réellement communs.

Exemples :

```text
CodeenButton
CodeenIconButton
CodeenInput
CodeenTextarea
CodeenSelect
CodeenTabs
CodeenPanel
CodeenDialog
CodeenPopover
CodeenTooltip
CodeenBadge
CodeenStatus
CodeenSection
CodeenDivider
```

Et pour l'IA :

```text
CodeenChatMessage
CodeenToolCall
CodeenToolResult
CodeenAgentStep
CodeenApproval
CodeenThinking
CodeenTaskProgress
CodeenDiffActions
CodeenModelSelector
CodeenContextIndicator
```

Mais ne crée pas ces composants artificiellement.

Crée-les lorsqu'ils correspondent réellement à une réutilisation constatée dans les designs.

---

# 17. ONBOARDING

Commence par transformer les écrans :

- onboarding welcome ;
- providers ;
- theme picker ;
- settings import.

Respecte exactement le parcours fonctionnel décrit dans l'inventaire.

Conserve :

- navigation ;
- skip ;
- validation ;
- providers ;
- thèmes ;
- import ;
- états loading ;
- erreurs ;
- succès.

Le nouveau design doit remplacer l'ancien visuellement sans casser le fonctionnement.

---

# 18. EMPTY EDITOR HOME

Implémente la nouvelle Home en utilisant :

- le nouveau logo ;
- le Design System ;
- Outfit ;
- les composants Codeen ;
- les vrais raccourcis VS Code ;
- les commandes existantes.

Les actions doivent réellement exécuter les commandes correspondantes.

Ne transforme pas cette page en simple maquette statique.

---

# 19. WORKSPACE SHELL

Pour le shell principal, travaille avec une logique différente.

Analyse précisément :

- title bar ;
- command center ;
- activity bar ;
- sidebar ;
- auxiliary bar ;
- editor groups ;
- tabs ;
- panel ;
- status bar.

Pour chaque élément :

1. déterminer s'il est natif VS Code ;
2. déterminer ce qui peut être obtenu avec le thème ;
3. déterminer ce qui peut être personnalisé avec une contribution ;
4. déterminer ce qui nécessite une modification Workbench ;
5. déterminer ce qui doit rester natif.

Ne reconstruis jamais une surface native uniquement parce qu'elle est difficile à styliser.

---

# 20. ACTIVITY BAR

Le design doit donner une vraie identité Codeen à l'Activity Bar.

Mais :

- conserve les commandes ;
- conserve les vues ;
- conserve les comportements ;
- conserve les raccourcis ;
- conserve les badges.

Travaille sur :

- iconographie ;
- active state ;
- hover ;
- spacing ;
- background ;
- focus ;
- intégration aux thèmes.

---

# 21. SIDEBAR

Pour Explorer, Search, Source Control, Run & Debug, Extensions, etc. :

préserve leur comportement natif.

Le redesign porte principalement sur :

- couleurs ;
- tokens ;
- typographie si appropriée ;
- icônes ;
- selected state ;
- hover ;
- spacing ;
- séparateurs ;
- toolbar.

Ne remplace pas le système d'arborescence VS Code par un faux arbre React simplement pour reproduire une maquette.

---

# 22. EDITOR

Monaco doit rester Monaco.

NE PAS :

- recréer l'éditeur ;
- simuler des lignes de code en HTML ;
- remplacer les buffers ;
- casser minimap ;
- casser folding ;
- casser autocomplete ;
- casser diagnostics.

Le design porte sur :

- thème ;
- syntax highlighting ;
- tabs ;
- breadcrumbs ;
- surrounding UI ;
- active states ;
- Codeen AI integrations.

---

# 23. CHAT

Le Chat est une surface Codeen-owned majeure.

Le nouveau design doit être implémenté réellement dans :

```text
SidebarChat
VoidChatArea
thread system
message renderer
tool rendering
task rendering
approval rendering
```

ou dans leurs équivalents réels après audit.

Ne détruis pas les fonctionnalités existantes :

- streaming ;
- threads ;
- modes ;
- @mentions ;
- attachments ;
- models ;
- reasoning ;
- tool calls ;
- MCP ;
- diffs ;
- approvals ;
- stop ;
- retry.

Le travail consiste à changer et améliorer l'expérience visuelle tout en préservant le moteur fonctionnel.

---

# 24. CHAT INPUT

Le nouveau design du champ de chat doit devenir un véritable composant fonctionnel.

Conserver :

- saisie ;
- multiline ;
- mentions ;
- attachments ;
- model ;
- mode ;
- microphone ;
- context ;
- send ;
- stop.

Tous les contrôles doivent rester fonctionnels.

Le design ne doit pas être une simple représentation graphique.

---

# 25. TOOL CALLS

Transforme les designs des tool calls en véritables composants fonctionnels.

Exemples :

```text
Read File
Search
Edit File
Terminal
MCP
```

Les états doivent rester synchronisés avec le vrai état de l'agent :

```text
queued
running
waiting
approval
success
error
cancelled
```

L'interface doit se mettre à jour réellement.

---

# 26. THINKING / REASONING

Le design du bloc Thinking doit rester connecté aux vrais états de streaming.

Ne simule jamais :

```text
Thinking...
```

si l'application ne l'est pas réellement.

Le composant doit refléter l'état réel du moteur.

---

# 27. AGENT TASK PROGRESS

Si le design présente une progression :

elle doit être alimentée par le vrai système de tâches.

Ne crée pas une fausse animation de progression.

La progression doit refléter :

- étapes ;
- outils ;
- états ;
- succès ;
- erreur ;
- interruption.

---

# 28. APPROVAL

Les boutons :

- Approve ;
- Reject ;

doivent être reliés aux vrais mécanismes de permission/approval du moteur Codeen.

Ne crée pas une interface visuellement correcte mais fonctionnellement inactive.

---

# 29. QUICK EDIT

Le design Quick Edit doit être intégré au véritable :

```text
Monaco ZoneWidget
```

ou au mécanisme réellement utilisé par Codeen.

Le widget doit rester :

- ancré correctement ;
- indépendant du scroll ;
- interactif ;
- fonctionnel ;
- compatible avec Ctrl+K ;
- connecté au vrai moteur IA.

---

# 30. FAST APPLY / DIFF

Les maquettes Fast Apply doivent être appliquées au véritable système de diff Codeen.

Préserver :

- Accept;
- Reject;
- Accept All;
- Reject All;
- navigation ;
- statut ;
- compteur ;
- multi-file ;
- état streaming.

Ne simule pas les diffs graphiquement.

Ils doivent rester de vrais changements éditoriaux.

---

# 31. SETTINGS

Le design Settings doit être appliqué au vrai système Codeen.

Conserver les fonctionnalités :

- providers ;
- models ;
- feature selection ;
- voice ;
- local models ;
- MCP ;
- options ;
- import/export ;
- telemetry ;
- etc.

Le design doit être une évolution de la vraie interface, pas une nouvelle page indépendante.

---

# 32. TOKEN USAGE

Pour le Token Usage :

préserver les données réelles.

Le nouveau design doit rester branché au service réel.

Le dashboard doit afficher les vraies données.

Pas de valeurs mockées en production.

---

# 33. LIGHT / DARK THEMES

Implémente les deux variantes lorsque le Design System les prévoit :

```text
Codeen Dark
Codeen Light
```

Le même système de composants doit fonctionner dans les deux.

Évite de dupliquer toute l'interface uniquement pour changer de thème.

---

# 34. MOTION

Implémente uniquement les animations prévues par le Design System.

Priorité :

- transitions ;
- état ;
- feedback ;
- apparition ;
- disparition ;
- expansion ;
- streaming ;
- tool state ;
- feedback interaction.

Pas d'animation décorative excessive.

Toutes les animations doivent rester performantes dans Electron.

---

# 35. PERFORMANCE

Attention particulière à :

- rendu React ;
- streaming ;
- longue conversation ;
- gros fichiers ;
- nombreux tool calls ;
- scrolling ;
- resize ;
- Monaco ;
- DOM ;
- animations.

Ne crée pas :

- re-render inutiles ;
- listeners globaux excessifs ;
- timers permanents ;
- animations CPU lourdes ;
- structures DOM démesurées.

---

# 36. ACCESSIBILITÉ

Tous les nouveaux composants doivent prendre en compte :

- clavier ;
- focus ;
- aria ;
- contrast ;
- disabled state ;
- navigation ;
- tooltip ;
- keyboard shortcuts.

---

# 37. RESPONSIVE WORKBENCH

Le design doit fonctionner lorsque :

- sidebar est étroite ;
- sidebar est large ;
- auxiliary bar est étroite ;
- chat est large ;
- chat est étroit ;
- panel est ouvert ;
- panel est fermé ;
- fenêtre est petite ;
- fenêtre est grande.

Les composants doivent s'adapter.

Ne reproduis pas une maquette à dimensions fixes.

---

# 38. ICONOGRAPHIE

Utilise le système défini dans le Design System.

Pour les éléments Codeen-owned :

utilise le système choisi par le design.

Pour les éléments natifs VS Code :

évalue l'utilisation des Codicons lorsque cela permet de conserver l'intégration native.

Ne remplace pas arbitrairement tout le système d'icônes du Workbench.

L'objectif est une cohérence visuelle, pas une réécriture gratuite.

---

# 39. HTML/CSS → PRODUCTION CODE

Lorsque tu rencontres :

```html
class="..."
style="..."
```

dans les maquettes :

ne transpose pas mécaniquement tout le HTML/CSS tel quel.

Analyse :

- quelle partie est structurelle ;
- quelle partie est visuelle ;
- quelle partie est un état ;
- quelle partie est un composant partagé ;
- quelle partie est spécifique à la maquette.

Puis transforme-la en :

- React ;
- TypeScript ;
- CSS/SCSS ;
- tokens ;
- composants Codeen ;
- contributions Workbench ;
- widgets Monaco ;

selon le cas.

---

# 40. NE PAS INTRODUIRE DE NOUVEAU FRAMEWORK INUTILE

Utilise l'architecture déjà présente dans Codeen.

Ne remplace pas :

- React ;
- Tailwind ;
- CSS ;
- build system ;
- composants ;

sans justification technique.

Le design doit s'intégrer à l'existant.

---

# 41. RÉUTILISATION DES STYLES

Évite les styles purement locaux lorsqu'ils peuvent être mutualisés.

Par exemple :

si dix composants utilisent :

```text
same radius
same border
same input
same button
same surface
```

ils doivent utiliser les mêmes tokens/components.

---

# 42. ORDRE D'IMPLÉMENTATION

Travaille dans l'ordre suivant, sauf si l'analyse justifie un changement :

## PHASE 0
Audit du dossier Design.

## PHASE 1
Audit du Design System.

## PHASE 2
Mapping Design → Inventory → Codebase.

## PHASE 3
Architecture des tokens Codeen.

## PHASE 4
Fondations composants.

## PHASE 5
Onboarding.

## PHASE 6
Empty Editor Home.

## PHASE 7
Chat / Agent.

## PHASE 8
Tool Calls / Thinking / Approval / Tasks.

## PHASE 9
Quick Edit / Fast Apply / Diff.

## PHASE 10
Settings.

## PHASE 11
Token Dashboard.

## PHASE 12
Workbench shell.

## PHASE 13
Light / Dark theme.

## PHASE 14
Responsive / Accessibility.

## PHASE 15
Polish / Motion.

## PHASE 16
Validation complète.

---

# 43. SPECIFY / SPEC-KIT

Utilise Specify pour organiser cette transformation.

Avant chaque grande phase :

- créer/mettre à jour la specification ;
- définir le plan ;
- définir les tâches ;
- définir les critères d'acceptation.

Ensuite :

- implémenter ;
- tester ;
- vérifier ;
- documenter.

Utilise les structures Specify déjà présentes dans Codeen.

Ne crée pas une deuxième méthode de gestion parallèle.

---

# 44. AVANT CHAQUE GROSSE MODIFICATION

Inspecte le code existant.

Identifie :

- service ;
- composant ;
- contribution ;
- extension point ;
- theme contribution ;
- command ;
- state ;
- event ;
- styles ;
- dépendances.

Puis seulement modifie.

---

# 45. GESTION DES RÉGRESSIONS

Le nouveau design ne doit pas casser :

- navigation ;
- commandes ;
- raccourcis ;
- extensions ;
- editor groups ;
- tabs ;
- terminal ;
- source control ;
- settings ;
- AI;
- tools ;
- MCP ;
- streaming ;
- diff ;
- filesystem.

Une amélioration visuelle qui casse une fonctionnalité n'est PAS considérée comme réussie.

---

# 46. TESTS

Après chaque grande surface :

- typecheck ;
- lint ;
- tests unitaires pertinents ;
- tests d'intégration ;
- tests UI si disponibles.

Puis :

- build ;
- démarrage réel de Codeen ;
- vérification manuelle de la surface.

---

# 47. TEST VISUEL

Lorsque possible, compare le résultat réel avec les maquettes.

Vérifie :

- structure ;
- proportions ;
- spacing ;
- typography ;
- color ;
- alignment ;
- hierarchy ;
- states ;
- interactions.

Le but n'est pas nécessairement une reproduction pixel-perfect aveugle.

Le but est une reproduction visuelle fidèle **adaptée à l'architecture réelle de Codeen**.

---

# 48. NE SACRIFIE PAS L'ARCHITECTURE POUR UNE MAQUETTE

Si une maquette utilise une structure qui serait mauvaise dans VS Code :

NE force pas la structure.

Cherche comment produire :

> le même résultat visuel et interactionnel

avec :

> la bonne architecture Codeen / VS Code.

C'est une règle extrêmement importante.

---

# 49. NE SACRIFIE PAS LE DESIGN POUR L'ARCHITECTURE

Inversement, ne conserve pas l'ancien design simplement parce que le code existant est plus facile.

Lorsque le composant doit réellement changer :

→ refactore-le.

Lorsque l'architecture UI actuelle empêche le nouveau design :

→ trouve une meilleure implémentation.

L'objectif est d'obtenir les deux :

# DESIGN + ARCHITECTURE PROPRE

---

# 50. PAS DE MOCKS POUR LES FONCTIONNALITÉS EXISTANTES

Ne transforme pas les fonctionnalités réelles en démos.

Par exemple :

```text
Fake tool call
Fake terminal output
Fake token count
Fake model selection
Fake thread
Fake settings
```

sont interdits comme implémentation finale.

Tout doit rester connecté aux services réels.

---

# 51. CONSERVATION DU MOTEUR

Le changement doit être principalement :

```text
UI
+
Design System
+
Interaction presentation
+
Visual language
+
Codeen contributions
```

et NON :

```text
réécriture du moteur VS Code
```

Monaco et le moteur d'édition doivent rester stables.

---

# 52. FUTUR BACKEND

Ne mets pas encore en place :

- authentification cloud ;
- abonnement ;
- crédits ;
- billing ;
- WebSocket serveur ;
- backend commercial ;

sauf si un élément existe déjà et doit simplement être préservé.

Cette mission concerne la transformation du produit desktop et de son interface.

L'architecture doit seulement rester compatible avec une intégration future.

---

# 53. CODEEN BRANDING

Le résultat final doit utiliser exclusivement l'identité Codeen dans les parties concernées.

Supprime progressivement les traces visuelles inutiles de :

- Void ;
- ancien branding ;
- composants génériques ;
- styles hérités qui contredisent le Design System.

Mais ne supprime pas une référence technique simplement parce qu'elle contient le mot "void".

Une distinction doit être faite entre :

```text
branding à remplacer
```

et :

```text
identifiant technique qu'il serait dangereux de renommer
```

La priorité est la stabilité.

---

# 54. RÉFÉRENCES TECHNIQUES

Lorsque tu dois modifier une surface VS Code, cherche d'abord les vrais points d'extension appropriés.

Par exemple :

- theme contribution ;
- color registry ;
- workbench part ;
- editor contribution ;
- activity bar;
- status bar;
- auxiliary bar ;
- editor input ;
- overlay widget ;
- zone widget ;
- command contribution ;
- menu contribution ;
- view contribution.

N'utilise pas une solution CSS globale sauvage lorsqu'un mécanisme officiel existe déjà dans l'architecture.

---

# 55. CSS GLOBAL

Évite les hacks du genre :

```css
.vscode-class-x .something {
    ...
}
```

partout dans le projet.

Un override global peut être nécessaire dans certains cas, mais :

- documente-le ;
- limite sa portée ;
- vérifie les effets secondaires ;
- préfère les tokens et points d'extension appropriés.

---

# 56. MAINTENABILITÉ

Le futur Codeen doit être facile à faire évoluer.

Une modification future du Design System doit pouvoir être répercutée sans modifier 100 composants indépendamment.

Construis donc :

```text
Design Tokens
      ↓
Shared Components
      ↓
Feature Components
      ↓
Screens
```

plutôt que :

```text
Screen A → styles particuliers
Screen B → styles particuliers
Screen C → styles particuliers
```

---

# 57. DOCUMENTATION DE L'IMPLÉMENTATION

À mesure que tu avances, documente :

- mapping des designs ;
- composants ;
- tokens ;
- points Workbench ;
- customizations VS Code ;
- composants React ;
- widgets Monaco ;
- exceptions ;
- décisions techniques.

Une autre personne doit pouvoir comprendre pourquoi chaque surface a été implémentée à tel niveau.

---

# 58. CRITÈRE DE RÉUSSITE

La mission est réussie lorsque :

### VISUELLEMENT

Codeen ressemble réellement aux nouveaux designs.

### FONCTIONNELLEMENT

Les interactions réelles de Codeen continuent de fonctionner.

### ARCHITECTURALEMENT

Les interfaces sont intégrées au bon niveau du système.

### TECHNIQUEMENT

Le Workbench et Monaco restent stables.

### DESIGN SYSTEM

Les composants partagent réellement les mêmes tokens et règles.

### BRAND

Le produit est cohérent de bout en bout.

---

# 59. CRITÈRE PARTICULIER

Lorsque quelqu'un lance Codeen :

## Onboarding

doit sembler appartenir à Codeen.

## Home

doit sembler appartenir à Codeen.

## Workspace

doit sembler appartenir à Codeen.

## Chat

doit sembler appartenir à Codeen.

## Agent

doit sembler appartenir à Codeen.

## Settings

doit sembler appartenir à Codeen.

## Diff

doit sembler appartenir à Codeen.

## Tool calls

doivent sembler appartenir à Codeen.

## Native VS Code areas

doivent également s'intégrer au langage visuel Codeen.

Le but final est :

> une seule application, une seule identité, un seul système visuel.

---

# 60. PREMIÈRE ACTION À EXÉCUTER

NE COMMENCE PAS À MODIFIER LES FICHIERS IMMÉDIATEMENT.

Commence par :

1. inspecter entièrement le dossier Design ;
2. identifier le Design System ;
3. identifier tous les écrans ;
4. analyser leurs fichiers ;
5. analyser le Master Inventory ;
6. analyser le codebase actuel ;
7. créer le mapping Design → Inventory → Codeen ;
8. identifier les composants réutilisables ;
9. identifier les surfaces natives VS Code ;
10. identifier les surfaces Codeen-owned ;
11. définir la stratégie d'intégration ;
12. créer/mettre à jour la specification Specify ;
13. produire le plan d'implémentation.

Puis commence l'implémentation phase par phase.

---

# 61. RÈGLE FINALE

Tu ne dois jamais prendre une maquette HTML/CSS et te dire :

> "Je vais simplement l'afficher dans Codeen."

Tu dois te demander :

> "Quelle est l'architecture correcte de Codeen pour produire cette même expérience ?"

Puis implémenter cette solution au bon niveau :

- Theme ;
- Workbench ;
- Contribution ;
- React ;
- Monaco ;
- Service ;
- State ;
- Component ;
- CSS ;
- SVG ;
- Electron.

Le design fourni est la DESTINATION VISUELLE.

L'architecture Codeen est le VÉHICULE.

Je veux que tu utilises le bon véhicule pour atteindre exactement cette destination.

Commence maintenant par l'audit du dossier Design et la construction du plan Specify.
```

### La logique derrière ce prompt

Tu vas donc avoir une chaîne beaucoup plus propre :

```text
                 ┌────────────────────┐
                 │ UI/UX INVENTORY    │
                 │ contrat fonctionnel│
                 └─────────┬──────────┘
                           │
                           ▼
┌──────────────────────────────────────────────┐
│              CODEEN DESIGN SYSTEM            │
│ couleurs / typo / tokens / spacing / motion │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
             ┌───────────────────┐
             │  STITCH SCREENS   │
             │  HTML/CSS/SVG     │
             └─────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │     LLM CODEEN   │
              │                  │
              │ mapping + specs  │
              │ architecture     │
              │ implementation   │
              └────────┬─────────┘
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       VS Code       React        Monaco
       Theme         Codeen       Widgets
       Workbench     Components   Editor
          │            │             │
          └────────────┼─────────────┘
                       ▼
                 ┌────────────┐
                 │   CODEEN   │
                 │   final    │
                 └────────────┘
```
