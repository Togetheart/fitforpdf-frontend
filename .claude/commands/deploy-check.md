Vérifie que le projet est prêt à déployer.

Exécute ces vérifications dans l'ordre :

1. **Tests** : Lance `npm test`. Si des tests échouent, arrête et signale.
2. **Build** : Lance `npm run build`. Si le build échoue, analyse l'erreur et propose un fix.
3. **Git status** : Vérifie qu'il n'y a pas de changements non commités avec `git status`.
4. **Résumé** : Affiche un résumé vert/rouge de chaque étape.

Ne déploie pas — signale uniquement si tout est prêt.
