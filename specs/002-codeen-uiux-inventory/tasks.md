# Tâches & Jalons de Préparation UX/UI : Codeen IDE

## Jalon 1 : Cartographie et Inventaire (Terminé)
- [x] **T-01** : Explorer tous les composants React dans `src/vs/workbench/contrib/void/browser/react`.
- [x] **T-02** : Identifier toutes les contributions Workbench (Panes, EditorPanes, Status Bar, Actions).
- [x] **T-03** : Cartographier les flux utilisateurs (Onboarding, Empty Editor, Chat session, Settings).
- [x] **T-04** : Documenter les tokens CSS, les icônes (Lucide / Codicons) et la typographie.
- [x] **T-05** : Créer le Master Inventory dans `specs/002-codeen-uiux-inventory/spec.md`.

---

## Jalon 2 : Collecte des Ressources Visuelles (À Exécuter par l'Équipe)
- [ ] **T-06** : Capturer les 18 écrans de référence identifiés dans la section 10 de la spécification.
- [ ] **T-07** : Organiser les captures dans un dossier d'artefacts `docs/design/assets/baseline/`.
- [ ] **T-08** : Relever les incohérences de marges et de padding entre les composants.

---

## Jalon 3 : Définition du Design System Cible (Phase de Conception)
- [ ] **T-09** : Définir la palette de couleurs finale (Dark mode profond, accents subtils).
- [ ] **T-10** : Spécifier le système typographique (Google Fonts Outfit / Inter pour le shell, monospace épuré pour le code).
- [ ] **T-11** : Concevoir les mockups haute fidélité pour l'Onboarding, l'Empty Editor et le Chat.

---

## Jalon 4 : Implémentation Progressive (Phase de Développement)
- [ ] **T-12** : Mettre à jour `styles.css` et les thèmes Codeen JSON sans altérer la logique métier.
- [ ] **T-13** : Intégrer les nouveaux composants React d'Onboarding et d'accueil.
- [ ] **T-14** : Appliquer les styles affinés à la barre de chat et aux widgets flottants.
- [ ] **T-15** : Valider la compilation complète (`compile-client`, `buildreact`) et l'absence de régressions.
