import { SceneRig } from './sceneRig.js';
import { $, show, hide } from './utils.js';
import { formatClock } from './gameState.js';
import { zelligeTransition } from './transitions.js';

import { runAct1 } from './acts/act1_apartment.js';
import { runAct2 } from './acts/act2_street.js';
import { runAct3 } from './acts/act3_bristol.js';
import { runAct4 } from './acts/act4_setup.js';
import { runAct5 } from './acts/act5_reunion.js';
import { runAct6 } from './acts/act6_proposal.js';

const canvas = $('scene-canvas');
const rig = new SceneRig(canvas);

const ACTS = [runAct1, runAct2, runAct3, runAct4, runAct5, runAct6];

function updateClockHud() {
  $('time-text').textContent = formatClock();
}

async function playAll() {
  show($('time-hud'));
  for (let i = 0; i < ACTS.length; i++) {
    await zelligeTransition(async () => {
      updateClockHud();
    });
    updateClockHud();
    await ACTS[i](rig);
    updateClockHud();
  }
}

$('btn-start').addEventListener('click', () => {
  hide($('title-screen'));
  playAll().catch((err) => {
    // Filet de sécurité : ne jamais bloquer silencieusement le joueur
    console.error('Erreur de jeu :', err);
  });
});
