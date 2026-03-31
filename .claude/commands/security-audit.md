Audit de sécurité complet du frontend Next.js App Router.

Vérifie ces 8 points et produis un tableau récapitulatif :

### 1. Secrets côté client
- Grep dans `app/components/` et `app/hooks/` pour : `API_KEY`, `SUPABASE`, `STRIPE`, `SECRET`, `BACKEND_URL`
- Seules les variables `NEXT_PUBLIC_*` sont autorisées dans le code client
- Vérifie que `process.env.NEATEXPORT_API_KEY` et `process.env.CLEAN_SHEET_API_URL` ne sont utilisés que dans `app/api/` ou `app/lib/`
- Signale tout import de `backendKeys` dans un composant client

### 2. API routes proxy
- Pour chaque route dans `app/api/`, vérifie que l'API key est injectée via `getNeatExportApiKey()` (server-side)
- Vérifie que le header `X-NEATEXPORT-KEY` n'est jamais construit à partir des headers de la requête client
- Vérifie que `CLEAN_SHEET_API_URL` / `BACKEND_URL` ne sont jamais renvoyés dans la réponse

### 3. Headers forwarding
- Lis la fonction `copyPassThroughHeaders` dans `app/api/render/route.js`
- Vérifie qu'elle utilise un whitelist strict (pas de `for...of response.headers`)
- Lis `buildUpstreamHeaders` — vérifie que seuls les headers explicites sont transmis au backend

### 4. Filename sanitization
- Vérifie que `sanitizeFilenameBase` est utilisé sur les noms de fichiers provenant de l'upstream
- Vérifie qu'il supprime les séparateurs de répertoire (`/`, `\`) et les caractères dangereux
- Vérifie que le Content-Disposition header utilise le nom sanitisé

### 5. CSP / Security headers
- Vérifie si un Content-Security-Policy est configuré dans `next.config.mjs` ou un middleware
- Vérifie les headers de sécurité (X-Frame-Options, X-Content-Type-Options)
- Signale si absent avec une recommandation de headers à ajouter

### 6. Dépendances vulnérables
- Lance `npm audit --production` dans `/Users/sneusch/Dev/fitforpdf/fitforpdf-frontend`
- Signale les vulnérabilités high et critical
- Propose des commandes `npm audit fix` si applicable

### 7. Env files
- Vérifie que `.env.local` et `.env*.local` sont dans `.gitignore`
- Grep dans les fichiers committés pour des patterns de clés (sk_live, sk_test, phc_, re_)
- Vérifie qu'aucun fichier `.env` n'est tracké par git (`git ls-files '*.env*'`)

### 8. Résumé
Produis un tableau markdown :
| # | Vérification | Statut | Détails |
|---|---|---|---|
| 1 | Secrets côté client | PASS/FAIL/WARN | ... |
| ... | ... | ... | ... |
