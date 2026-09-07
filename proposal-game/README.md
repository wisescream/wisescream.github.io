# Ce Soir — Reda

Jeu narratif mobile 3D (10-15 min), jouable directement dans le navigateur via **Three.js** — aucune étape de build nécessaire, 100% statique, donc compatible **GitHub Pages** tel quel.

## Déploiement sur GitHub Pages

1. Pousse tout le contenu de ce dossier à la racine du repo (ou dans un dossier `/docs`).
2. Dans **Settings → Pages** du repo, choisis la branche et le dossier (`/root` ou `/docs`).
3. GitHub Pages sert `index.html` automatiquement — aucune configuration supplémentaire.

Le fichier `index.html` charge Three.js via CDN (`import map` vers `cdn.jsdelivr.net`), donc pas de `node_modules` ni de bundler à gérer.

## Structure

```
index.html              point d'entrée, UI overlay (dialogues, mini-jeux, écrans)
css/style.css           palette ocre/terracotta/bleu nuit/doré, styles UI
js/
  main.js               orchestrateur : enchaîne les 6 actes avec transition zellige
  sceneRig.js            renderer/caméra/scène Three.js + presets d'éclairage par acte
  gameState.js            état de partie partagé (tenue, fleurs, scores, horloge)
  dialogue.js              système de dialogue à choix (tonal, sans branchement dur)
  transitions.js           transition visuelle "zellige" entre actes
  utils.js                 helpers génériques
  acts/
    act1_apartment.js       appartement, choix de tenue, SMS ambigu
    act2_street.js           trajet golden hour, PNJ, achat obligatoire
    act3_bristol.js          salle de billard, dialogues, mini-jeux
    act4_setup.js             choix des fleurs, flashback, placement des bougies
    act5_reunion.js            promenade, dialogue à choix tonal, plan sur elle
    act6_proposal.js            caméra cinématique scriptée, tap final, écran polaroid
  minigames/
    billiards.js               state machine du billard (angle + puissance)
    distraction.js               QTE de diversion + fouille sans fail state
    candles.js                   placement des bougies en drag & drop
```

## Notes de conception

- **Aucun fail state dur** nulle part : le billard influence le dialogue (pas une victoire/défaite bloquante), la fouille boucle narrativement jusqu'à réussite, le tap final n'a pas d'échec possible.
- **Géométrie procédurale** (primitives Three.js) plutôt que des assets 3D sur mesure — permet un poids de repo minimal et un chargement instantané, conforme à la contrainte mobile mid-range du brief.
- **Éclairage par acte** suit la feuille de style du GDD (`proposal-game-GDD.md`) : tungstène + néons au Bristol, golden hour en acte 2, clair de lune bleu-froid en actes 5-6.
- **Écran final "polaroid"** : capture réelle du canvas WebGL (`toDataURL`) au moment de la demande, pas une image statique.

## Prochaine étape

Ce prototype web valide la structure et les mécaniques. Si le projet bascule vers Unity/Godot/Unreal pour une version avec de vrais assets 3D et animations de personnage, les state machines des mini-jeux (`js/minigames/*.js`) se traduisent directement — la logique est déjà isolée du rendu.
