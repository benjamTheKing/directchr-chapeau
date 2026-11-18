# Socle catalogue des maquettes directchr.com

Ce socle est commun aux quatre propositions. Il contient les données des quatre univers, les visuels produit, la carte produit, le panier projet, la boîte d'échantillons, l'en-tête et le pied de page des pages catalogue.

## Données

Les quatre univers sont traités à égalité : environ 20 articles par catégorie, et aucun chiffre du site réel n'est affiché.

- `../data/textile.json` contient 240 tissus, soit 20 par famille sur 12 familles. Les photos viennent du catalogue textile.
- `../data/demo.json` contient 380 articles de sol, de mural et de mobilier, soit 20 par catégorie. Ils sont générés.
- Les compteurs affichés (produits, coloris, stock) viennent tous de `stats`, calculés de la même façon pour les quatre univers. Aucune distinction réel / démo n'est affichée, et aucun lien ne mène au site en ligne.

## Charger le socle dans une page

```html
<link rel="stylesheet" href="ROOT/assets/shared.css">
<link rel="stylesheet" href="ROOT/assets/catalogue/core.css">
<script src="ROOT/assets/catalogue/core.js"></script>
<script src="ROOT/assets/propositions.js" defer></script>
```

`ROOT` est le chemin relatif vers la racine du dossier `directchr-chapeau/`. `core.js` se charge sans `defer` quand un script en ligne s'en sert juste après. Sinon, il se charge avec `defer`, avant le `app.js` de la page.

## API `window.DCHR`

- `load()` renvoie une Promise de `{ all, by: { textile, mural, sol, mobilier }, get(u, h), stats }`. `stats[u]` vaut `{ products, colors, stock, cats: [{ k, n, count }] }`.
- Un produit a la forme `{ u, h, t, cat, catName, d, unit, min, pack, feu, specs: [[libellé, valeur]], es: [espaces], ma: [matières], gen, c: [{ k, n, h, s, img? }], o, dl, n, stock, fams }`. Pour le textile, s'ajoutent `md`, `us` et `cp`. Pour le mobilier, s'ajoutent `garni` et `dims`.
- `visual(p, ci, { fabric, cls, style })` renvoie un bloc `.vis` qui remplit son conteneur. Pour un meuble garni, `fabric` est l'URL d'une photo de tissu qui recouvre le dessin.
- `swatch(p, ci)` renvoie l'URL d'un échantillon carré (photo, texture ou finition).
- `card(p, { ci, href })` renvoie la carte produit `.pc`, à placer dans une grille `.pc-grid`.
- `productUrl(p, ci)` et `universeUrl(u, params)` construisent les adresses des pages.
- `accordsFor(p, data, n)` renvoie `{ univers: [{ p, ci, score }] }`, c'est-à-dire des produits des autres univers qui partagent des espaces avec `p` et dont la couleur est proche.
- `search(data, q, scope)` fait une recherche texte simple dans tous les champs.
- `projet` et `boite` sont des stores `localStorage`. Ils exposent `list()`, `count()`, `has(u, h, k)`, `add(item)`, `set(item)`, `remove(u, h, k)`, `clear()` et `on(fn)`.
  - Un élément du projet a la forme `{ u, h, k, q }`, où `q` est exprimé dans l'unité du produit.
  - La boîte accepte 8 éléments `{ u, h, k }` au plus. `add` renvoie `false` quand elle est pleine.
  - Tout élément portant `data-count="dchr-projet"` ou `data-count="dchr-boite"` est mis à jour automatiquement.
- `prop()` renvoie la proposition active : `1-plan`, `2-hotel`, `3-materiautheque` ou `4-comptoir`. Elle est mémorisée quand on visite une proposition ou qu'on passe `?prop=` dans l'adresse.
- `header({ current, q, scope })` remplace `<div data-dchr-header></div>` par la barre du haut, l'en-tête et un menu adapté à la proposition active. `footer()` remplace `<div data-dchr-footer></div>`.
- `toast(msg)` affiche un message.
- Utilitaires : `esc`, `num`, `nf`, `qty(n, unit)`, `familyOf(hex)`, `dist(hexA, hexB)`, et les tables `UNIVERS`, `U_ORDER`, `SPACES`, `MATIERES`, `FAM` et `COLOR_FAMILIES`.

## Adresses

| Adresse | Page |
|---|---|
| `/textile/`, `/mural/`, `/sol/`, `/mobilier/` | Catalogue d'un univers. Paramètres : `cat`, `q`, `es`, `ma`, `fam`, `feu`, `min` (quantité dans un seul coloris), `new=1`, `sort` |
| `/<univers>/?p=<handle>&c=<coloris>` | Fiche produit |
| `/projet/` | Projet en cours, c'est-à-dire le panier multi-univers |
| `/recherche/?q=&u=` | Recherche dans les quatre univers (propositions 1 à 3) |
| `/2-hotel/espace/?e=<espace>` | Page d'un espace de l'hôtel |
| `/3-materiautheque/matiere/` et `?m=<matière>` | Index des matières et page d'une matière |
| `/4-comptoir/recherche/?q=` | Résultats du comptoir, avec la ligne de besoin analysée |

Les fichiers du socle (`core.js`, `core.css`, `shared.css`, `propositions.js`) ne se modifient pas depuis une proposition. Un besoin qui manque s'implémente dans les fichiers de la page.
