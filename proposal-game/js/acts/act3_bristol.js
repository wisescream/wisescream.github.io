import * as THREE from 'three';
import { PALETTE } from '../sceneRig.js';
import { playDialogue } from '../dialogue.js';
import { runBilliards } from '../minigames/billiards.js';
import { runDistractionAndSearch } from '../minigames/distraction.js';
import { advanceClock } from '../gameState.js';

export async function runAct3(rig) {
  rig.clear();
  const lights = rig.applyLighting('bristol');
  rig.camera.position.set(0, 1.6, 5);
  rig.camera.lookAt(0, 1.2, -2);

  buildBristol(rig.scene);

  // Néons qui pulsent légèrement (indépendant de la musique dans cette démo)
  let t = 0;
  rig.onFrame((dt) => {
    t += dt;
    if (lights) {
      lights.neonA.intensity = 0.9 + Math.sin(t * 2.2) * 0.3;
      lights.neonB.intensity = 0.8 + Math.cos(t * 1.8) * 0.3;
    }
  });

  await playDialogue([
    { speaker: '', text: "Néons, fumée de narguilé, musique en sourdine. Le Bristol." },
    { speaker: 'Yassine', text: "T'es bizarre ce soir, Reda. T'as à peine touché ton verre." },
    { speaker: 'Sami', text: "Bon, on se fait une partie ou pas ?" },
  ]);

  const outcome = await runBilliards();

  if (outcome === 'win') {
    await playDialogue([
      { speaker: 'Yassine', text: "Bon, de toute façon j'aurais préféré perdre... vu ce que tu prépares." },
    ]);
  } else {
    await playDialogue([
      { speaker: 'Yassine', text: "Ha, je savais que t'avais la tête ailleurs. Remarque, avec ce qui t'attend ce soir, je comprends." },
    ]);
  }

  await playDialogue([
    { speaker: 'Karim', text: "Bon, je vous occupe deux minutes, j'ai un truc à vous raconter." },
  ]);

  await runDistractionAndSearch();

  await playDialogue([
    { speaker: 'Sami', text: "Attends... le fleuriste, le costume, le silence bizarre... Reda, dis-moi pas que—" },
    { speaker: 'Reda', text: "Bon, on y va ? Il commence à se faire tard." },
  ]);

  advanceClock(35);
}

function buildBristol(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x2a1f1a, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Table de billard jouable
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x1f5c3a, roughness: 0.6 })
  );
  table.position.set(-1.5, 0.4, -1);
  scene.add(table);

  // Table de billard secondaire (décorative)
  const table2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x1f5c3a, roughness: 0.6 })
  );
  table2.position.set(3.5, 0.4, -4.5);
  scene.add(table2);

  // Bar
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 1, 0.8),
    new THREE.MeshStandardMaterial({ color: PALETTE.terracotta, roughness: 0.5 })
  );
  bar.position.set(3, 0.5, 1.5);
  scene.add(bar);

  // Néons décoratifs
  const neonPanelA = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.3),
    new THREE.MeshStandardMaterial({ color: PALETTE.neonMagenta, emissive: PALETTE.neonMagenta, emissiveIntensity: 1.4 })
  );
  neonPanelA.position.set(-4, 2.3, -3.5);
  scene.add(neonPanelA);

  const neonPanelB = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.3),
    new THREE.MeshStandardMaterial({ color: PALETTE.neonCyan, emissive: PALETTE.neonCyan, emissiveIntensity: 1.4 })
  );
  neonPanelB.position.set(4, 2.3, -3.5);
  scene.add(neonPanelB);

  // Amis assis (silhouettes cylindriques stylisées)
  const friendMat = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.8 });
  [[-0.5, -2.2], [1.2, -2.2], [2.4, -1.6]].forEach(([x, z]) => {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.1, 8), friendMat);
    body.position.set(x, 0.85, z);
    scene.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), friendMat);
    head.position.set(x, 1.55, z);
    scene.add(head);
  });
}
