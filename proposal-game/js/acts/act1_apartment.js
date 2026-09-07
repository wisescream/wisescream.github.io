import * as THREE from 'three';
import { PALETTE } from '../sceneRig.js';
import { $, show, hide } from '../utils.js';
import { playDialogue } from '../dialogue.js';
import { gameState, advanceClock } from '../gameState.js';

export async function runAct1(rig) {
  rig.clear();
  rig.applyLighting('apartment');
  rig.camera.position.set(0, 1.5, 4.2);
  rig.camera.lookAt(0, 1, 0);

  buildRoom(rig.scene);

  await playDialogue([
    { speaker: '', text: "Appartement de Reda. Une soirée comme les autres... presque." },
  ]);

  await pickOutfit();

  await playDialogue([
    { speaker: 'SMS — Karim', text: '"Alors, prêt pour ce soir ?"' },
    { speaker: '', text: "Reda regarde le cadre photo retourné sur la table basse. Il ne le retourne pas." },
  ]);
  advanceClock(10);
}

function pickOutfit() {
  return new Promise((resolve) => {
    const outfitOptions = [
      { id: 'casual', label: 'Décontracté' },
      { id: 'chic', label: 'Chic sobre' },
      { id: 'classic', label: 'Classique' },
    ];
    const picker = $('outfit-picker');
    const row = $('outfit-options');
    row.innerHTML = '';
    outfitOptions.forEach((opt) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.textContent = opt.label;
      card.onclick = () => {
        gameState.outfit = opt.id;
        hide(picker);
        resolve();
      };
      row.appendChild(card);
    });
    show(picker);
  });
}

function buildRoom(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: PALETTE.terracotta, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: 1 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallMat);
  backWall.position.set(0, 2, -3);
  scene.add(backWall);

  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.5, 3),
    new THREE.MeshStandardMaterial({ color: PALETTE.bleuNuit, roughness: 0.8 })
  );
  bed.position.set(-2.5, 0.25, -1);
  scene.add(bed);

  const table = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 0.6 })
  );
  table.position.set(0.8, 0.18, 0.8);
  scene.add(table);

  // Cadre photo retourné (indice discret, jamais expliqué)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.02, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 })
  );
  frame.position.set(0.7, 0.37, 0.8);
  frame.rotation.y = 0.3;
  scene.add(frame);

  const wardrobe = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 0.6),
    new THREE.MeshStandardMaterial({ color: PALETTE.ocre, roughness: 0.7 })
  );
  wardrobe.position.set(2.8, 1.1, -2);
  scene.add(wardrobe);

  const lamp = new THREE.PointLight(PALETTE.or, 0.6, 4);
  lamp.position.set(0.8, 1.2, 0.8);
  scene.add(lamp);
}
