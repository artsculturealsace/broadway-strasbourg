# Broadway à Strasbourg — V1 site

Première maquette statique de la page d'accueil.

## Fichiers
- `index.html` : page d'accueil
- `css/style.css` : design responsive
- `js/main.js` : navigation mobile + animations d'apparition

## Mise en ligne GitHub Pages
1. Créer un dépôt GitHub public (par exemple `broadway-strasbourg`).
2. Ajouter le contenu de ce dossier à la racine du dépôt.
3. Dans **Settings → Pages**, choisir **Deploy from a branch**, branche `main`, dossier `/root`.
4. Après publication, renseigner le domaine personnalisé `broadway.artsculturealsace.eu` dans GitHub Pages.
5. Côté Cloudflare DNS, créer le CNAME du sous-domaine vers l'adresse GitHub Pages fournie.

La page `auditions/` sera ajoutée ensuite. Les boutons correspondants sont déjà configurés pour cette future URL.
