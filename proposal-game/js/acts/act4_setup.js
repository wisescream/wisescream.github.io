import * as THREE from 'three';
import { PALETTE } from '../sceneRig.js';
import { $, show, hide, delay } from '../utils.js';
import { playDialogue } from '../dialogue.js';
import { runCandlePlacement } from '../minigames/candles.js';
import { gameState, advanceClock } from '../gameState.js';

const FLASHBACK_TEXTS = {
  roses: "Un souvenir : elle riait en refusant les roses trop classiques, la première fois.",
  orangeBlossom: "Un souvenir : l'odeur de fleur d'oranger sur le balcon, un dimanche matin.",
  wildBouquet: "Un souvenir : elle cueillait des fleurs sauvages sur le bord de la route, en riant de lui.",
};

export async function runAct4(rig) {
  rig.clear();
  const lights = rig.applyLighting('duskSetup');
  rig.camera.position.set(0, 1.7, 5);
  rig.camera.lookAt(0, 1.2, -1);

  buildTerrace(rig.scene);

  await playDialogue([
    { speaker: '', text: "Le lieu qu'il a choisi depuis des semaines. Il ne reste plus qu'à tout préparer." },
  ]);

  const flower = await pickFlower();
  gameState.flowerChoice = flower;

  await showFlashback(FLASHBACK_TEXTS[flower]);

  await playDialogue([
    { speaker: '', text: "Il reste les bougies. Chacune à sa place." },
  ]);

  await runCandlePlacement();

  // Réchauffe la lumière d'ambiance à mesure que le décor est prêt
  if (lights && lights.candleGlow) {
    let intensity = 0;
    const target = 1.3;
    await new Promise((resolve) => {
      const step = () => {
        intensity = Math.min(target, intensity + 0.05);
        lights.candleGlow.intensity = intensity;
        if (intensity < target) requestAnimationFrame(step); else resolve();
      };
      step();
    });
  }

  await playDialogue([
    { speaker: '', text: "Tout est prêt. Il ne manque plus qu'elle." },
  ]);
  advanceClock(20);
}

function pickFlower() {
  return new Promise((resolve) => {
    const panel = $('flower-panel');
    const row = $('flower-options');
    row.innerHTML = '';
    const options = [
      { id: 'roses', label: 'Roses' },
      { id: 'orangeBlossom', label: 'Fleur d\u2019oranger' },
      { id: 'wildBouquet', label: 'Bouquet sauvage' },
    ];
    options.forEach((opt) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.textContent = opt.label;
      card.onclick = () => { hide(panel); resolve(opt.id); };
      row.appendChild(card);
    });
    show(panel);
  });
}

async function showFlashback(text) {
  const overlay = $('flashback-overlay');
  $('flashback-text').textContent = text;
  show(overlay);
  await delay(3200);
  hide(overlay);
}

function buildTerrace(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const parapet = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1, 0.3),
    new THREE.MeshStandardMaterial({ color: PALETTE.ocre, roughness: 0.8 })
  );
  parapet.position.set(0, 0.5, -3.9);
  scene.add(parapet);

  // Guirlande (points lumineux dorés)
  for (let i = -3; i <= 3; i++) {
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshStandardMaterial({ color: PALETTE.or, emissive: PALETTE.or, emissiveIntensity: 1 })
    );
    bulb.position.set(i * 1, 2.3 + Math.sin(i) * 0.1, -3.8);
    scene.add(bulb);
  }
}
