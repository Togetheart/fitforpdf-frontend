# Privacy Page Redesign — 2025-01

## Objectif
Améliorer l'UX/UI de la page `/privacy` pour qu'elle serve à la fois de page de confiance (conversion) et de référence légale. Utilisation de Tailwind pour les blocs.

## Direction design — "Clarity Vault"
- **Ton** : Blanc épuré, vert émeraude comme seule couleur de confiance, typographie Satoshi bold assertive
- **Différenciation** : Timeline visuelle du cycle de vie des fichiers (upload → conversion → suppression)

## Changements apportés

### Hero
- Shield amélioré avec anneau de lumière et glow émeraude (→ premium vs SVG brut)
- Row de 5 trust badges horizontaux scannables : 🇫🇷 France / ⏱ Files deleted instantly / 📄 PDFs 15 min / 🚫 No content stored / ✓ GDPR

### Section File Handling
- **Avant** : 2 cards plates "Files" + "Generated PDFs"
- **Après** : Timeline visuelle en 2 rows (uploaded file / generated PDF) avec connecteurs, icônes, sublabels, et étapes colorées

### Section Logs
- **Avant** : Card verre basique
- **Après** : Card structurée avec header strip, divide-y, footer note "File contents never stored"

### Section "What we don't do" (nouveau)
- Contenu existant dans siteCopy (`dontDo`) mais non affiché
- Maintenant affiché comme liste d'items avec icône ✕ rouge, visuellement distinct

### Sensitive callout
- **Avant** : Callout verre neutre
- **Après** : Callout ambre avec icône ⚠️, border ambre, meilleur contraste

### Léger: eyebrow labels
- Chaque section a un micro-label uppercase pour renforcer la hiérarchie

## Fichiers modifiés
- `app/privacy/page.jsx` — refonte complète

## Build
- ✅ `next build` sans erreur, `/privacy` : 3.04 kB First Load JS
