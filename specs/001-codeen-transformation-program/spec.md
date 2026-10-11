# Spécification Fonctionnelle : Refonte et Alignement Intégral sur Loophole (Codeen IDE)

## 1. Contexte & Directive Stratégique
Le codebase de référence unique et exclusif est **Loophole** (`e:\dev\loophole\loophole`).
Toute divergence, implémentation ad-hoc non présente dans Loophole ou altération visuelle arbitraire (ex: couleurs bleu nuit forcées, en-têtes promotionnels imposés, modules non documentés) est considérée comme un dérivement et doit être purgée.
L'objectif est d'atteindre une parité stricte d'architecture, d'ergonomie (UI/UX) et de fonctionnalités avec Loophole, sous la marque **Codeen**.

---

## 2. Périmètre Fonctionnel & Exigences Clés

### 2.1. Thèmes & Design System CSS
- **Source de vérité** : `src/vs/workbench/contrib/void/browser/react/src/styles.css` et `tailwind.config.js` de Loophole.
- **Principe** : Utilisation exclusive des variables sémantiques natives de VS Code (`--void-bg-1`, `--void-bg-2`, `--void-bg-3`, `--void-fg-1`, etc.).
- **Suppression** : Retrait complet des couleurs sombres codées en dur (`#0B0F14`, etc.) pour assurer une adaptation fluide à tous les thèmes (sombre, clair, contrasté).

### 2.2. Système Audio & Transcription Locale Zero-Cloud (Local Voice)
- **Source de vérité** : `localVoiceModelService.ts`, `localVoiceModelTypes.ts`, `LocalVoiceModelSettings.tsx` de Loophole.
- **Fonctionnalités** :
  - Support des modèles Whisper ONNX (`Xenova/whisper-tiny`, `Xenova/whisper-base`).
  - Gestion d'état complète (`notInstalled`, `downloading`, `loading`, `ready`, `error`).
  - Téléchargement avec barre de progression en temps réel et option de suppression.
  - Intégration du composant compact dans l'onboarding (étape Provider) et dans les paramètres de Codeen.
  - Bouton micro discret dans la barre de chat avec enregistrement à 16kHz et insertion directe du texte transcrit.

### 2.3. Panneau de Chat Agentique (`SidebarChat.tsx`)
- **Source de vérité** : `src/vs/workbench/contrib/void/browser/react/src/sidebar-tsx/SidebarChat.tsx` de Loophole.
- **Agencement UI** :
  - Suppression de tout en-tête promotionnel statique.
  - Accès direct au champ de saisie en haut du panneau.
  - Affichage en dessous des suggestions de prompts interactives ou de l'historique des threads.
  - Sélecteur de mode (Agent / Chat), sélecteur de modèle et bouton microphone discret.

### 2.4. Écran d'Éditeur Vide & Filigrane (`EmptyEditorHome.tsx` & `editorGroupWatermark.ts`)
- **Source de vérité** : `EmptyEditorHome.tsx` et `editorgroupview.css` de Loophole.
- **Composants** :
  - Remplacement définitif des anciens cubes Void par les visuels vectoriels SVG natifs (`letterpress-*.svg`).
  - Titre épuré : *« Beyond Code Completion — An Agentic AI IDE »*.
  - Grille de raccourcis essentiels dynamiquement résolus depuis `IKeybindingService`.

### 2.5. Parcours d'Onboarding à 4 Étapes Pures (`VoidOnboarding.tsx`)
- **Étape 0 — Welcome** : Grand titre épuré + Logo centré + Bouton `Get Started`.
- **Étape 1 — Add a Provider** : Onglets (Free, Paid, Local, Cloud/Other) + Checklist de fonctionnalités + Formulaires de connexion + Module compact `LocalVoiceModelSettings` + Navigation (`Back`, `Skip for now`, `Next`).
- **Étape 2 — Choose your theme** : Grille 2×2 avec aperçu de code JavaScript en direct, application immédiate au clic, coche de sélection active + Navigation (`Back`, `Next`).
- **Étape 3 — Settings and Themes** : Transfert 1-clic depuis VS Code, Cursor, Windsurf via `OneClickSwitchButton` + Bouton de finalisation **`Enter Codeen`**.
- Bouton de fermeture/skip instantané (`X`) en haut à droite.

### 2.6. Modale de Jetons & Métriques (`TokenUsageDialog.tsx`)
- Modale centrée avec isolation CSS, fermée par défaut (`isOpen: false`), ouverture uniquement sur action utilisateur, fermeture par `Échap` ou clic externe.

---

## 3. Critères d'Acceptation
1. Zero régression de compilation TypeScript (`compile-client`) et React (`buildreact`).
2. L'interface s'adapte immédiatement et fidèlement aux thèmes sombres et clairs sans couleur parasite.
3. Le module audio local Whisper est entièrement fonctionnel (détection, téléchargement, statut).
4. Le chat démarre instantanément sans distraction visuelle superflue.
