Audite le SEO de la page spécifiée : $ARGUMENTS

Si aucun argument fourni, audite `app/page.jsx` (landing).

Vérifie ces éléments :

1. **Metadata** :
   - `title` présent et < 60 caractères
   - `description` présente et entre 120-160 caractères
   - `openGraph` complet (title, description, url, images)
   - `twitter` complet (card, title, description)

2. **JSON-LD** :
   - Schema structuré présent (SoftwareApplication, Article, ou Organization)
   - Champs obligatoires remplis

3. **Headings** :
   - Un seul `<h1>` par page
   - Hiérarchie correcte (h1 → h2 → h3, pas de saut)

4. **Liens internes** :
   - Au moins 2 liens vers d'autres pages du site
   - Vérifie que les pages liées existent

5. **Images** :
   - Attributs `alt` présents sur toutes les images
   - `next/image` utilisé (pas de `<img>` brut)

6. **Résumé** : Tableau avec chaque point et statut (pass/fail/warning).
