Scaffolde une nouvelle page marketing pour le slug : $ARGUMENTS

1. **Détermine le type** :
   - Si le slug commence par `for-` → utilise le template `VerticalPage.jsx`
   - Si le slug commence par `vs-` → utilise le template `VsPage.jsx`
   - Sinon → crée une page standalone avec `SiteShell`, `PageHero`, et `FaqAccordion`

2. **Crée le dossier et fichier** : `app/$ARGUMENTS/page.jsx`

3. **Ajoute les métadonnées SEO** :
   - `export const metadata` avec title, description, openGraph, twitter
   - Regarde les pages existantes du même type pour le format exact

4. **Ajoute le JSON-LD** : Utilise le composant `JsonLd` avec le schema approprié (Article pour blog, SoftwareApplication pour pages produit)

5. **Ajoute la copy** dans `app/siteCopy.mjs` si nécessaire (section dédiée pour la nouvelle page)

6. **Ajoute des liens internes** : Identifie 2-3 pages existantes pertinentes et ajoute des crosslinks bidirectionnels

7. **Montre un aperçu** du fichier créé et demande si des ajustements sont nécessaires.
