import * as THREE from 'three';
import { PALETTE } from '../sceneRig.js';
import { $, show, hide } from '../utils.js';
import { playDialogue } from '../dialogue.js';
import { gameState, advanceClock } from '../gameState.js';

export async function runAct2(rig) {
  rig.clear();
  rig.applyLighting('goldenHourStreet');
  rig.camera.position.set(0, 1.6, 6);
  rig.camera.lookAt(0, 1.2, -4);

  buildStreet(rig.scene);

  await playDialogue([
    { speaker: '', text: "La rue s'étire, dorée par le soleil couchant. Le muezzin résonne au loin." },
  ]);

  await playDialogue([
    { speaker: 'Vendeur ambulant', text: "Des amandes grillées, mon ami ? Fraîches du jour !" },
  ]);
  await playDialogue([
    { speaker: 'Chauffeur de petit taxi', text: "Besoin d'une course ? Non ? Bonne soirée alors." },
  ]);

  // Achat obligatoire — l'objet non encore en possession du joueur
  const needsFlowers = true; // pour cette démo, le joueur passe toujours par le fleuriste
  gameState.purchasedItem = needsFlowers ? 'flowers' : 'jewelry';

  await showShop(needsFlowers);

  await playDialogue([
    { speaker: '', text: "Au loin, une enseigne au néon clignote doucement : Bristol." },
  ]);
  advanceClock(15);
}

function showShop(needsFlowers) {
  return new Promise((resolve) => {
    const panel = $('shop-panel');
    $('shop-title').textContent = needsFlowers ? 'Chez le fleuriste' : 'Chez le bijoutier';
    $('shop-desc').textContent = needsFlowers
      ? "Un petit bouquet, discrètement enveloppé."
      : "Un écrin, discrètement glissé dans la poche.";
    const btn = $('btn-shop-buy');
    btn.onclick = () => { hide(panel); resolve(); };
    show(panel);
  });
}

function buildStreet(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 40),
    new THREE.MeshStandardMaterial({ color: 0x6b5b4a, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -14;
  scene.add(floor);

  const facadeMat = [PALETTE.ocre, PALETTE.terracotta, 0x8a5a3a];
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(3, 4 + (i % 3), 3),
      new THREE.MeshStandardMaterial({ color: facadeMat[i % facadeMat.length], roughness: 0.85 })
    );
    bld.position.set(side * 4.5, (4 + (i % 3)) / 2, -i * 4 - 2);
    scene.add(bld);
  }

  // Petit taxi
  const taxi = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 3),
    new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4, metalness: 0.3 })
  );
  taxi.position.set(-2.2, 0.4, -6);
  scene.add(taxi);

  // Bristol sign (glow box placeholder, actual scene built in act3)
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 0.1),
    new THREE.MeshStandardMaterial({ color: PALETTE.neonMagenta, emissive: PALETTE.neonMagenta, emissiveIntensity: 1.2 })
  );
  sign.position.set(0, 3, -26);
  scene.add(sign);
}
