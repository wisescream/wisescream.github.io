import * as THREE from 'three';
import { PALETTE } from '../sceneRig.js';
import { playDialogue } from '../dialogue.js';
import { advanceClock } from '../gameState.js';

export async function runAct5(rig) {
  rig.clear();
  rig.applyLighting('moonlitWalk');
  rig.camera.position.set(0, 1.6, 5);
  rig.camera.lookAt(0, 1.3, -2);

  buildWalk(rig.scene);

  await playDialogue([
    { speaker: '', text: "Elle l'attend au coin de la rue, comme convenu. Ils marchent, sans se presser." },
    {
      speaker: 'Reda',
      text: "Choisis le ton de la conversation.",
      choices: [
        'Léger et taquin',
        'Doux et attentif',
        'Complice et silencieux',
      ],
    },
  ]);

  await reactionShot(rig);

  await playDialogue([
    { speaker: '', text: "Elle sourit, un peu plus longtemps que d'habitude. Quelque chose flotte dans l'air." },
  ]);
  advanceClock(15);
}

function reactionShot(rig) {
  return new Promise((resolve) => {
    const originalPos = rig.camera.position.clone();
    const originalTarget = new THREE.Vector3(0, 1.3, -2);
    const closePos = new THREE.Vector3(0.6, 1.6, -0.8);

    let t = 0;
    const duration = 2.2;
    function step(dt) {
      t += dt;
      const p = Math.min(t / duration, 1);
      rig.camera.position.lerpVectors(originalPos, closePos, easeInOut(p));
      rig.camera.lookAt(-0.3, 1.5, -2);
      if (p >= 1) {
        rig._animateCallbacks = rig._animateCallbacks.filter((cb) => cb !== step);
        setTimeout(() => {
          rig.camera.position.copy(originalPos);
          rig.camera.lookAt(originalTarget);
          resolve();
        }, 900);
      }
    }
    rig.onFrame(step);
  });
}

function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

function buildWalk(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 30),
    new THREE.MeshStandardMaterial({ color: 0x24304f, roughness: 1 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -10;
  scene.add(floor);

  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 5, 2.5),
      new THREE.MeshStandardMaterial({ color: PALETTE.bleuNuit, roughness: 0.9 })
    );
    bld.position.set(side * 3.5, 2.5, -i * 5 - 3);
    scene.add(bld);
    const window1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xffcf9e, emissive: 0xffcf9e, emissiveIntensity: 0.8 })
    );
    window1.position.set(side * (3.5 - 1.3), 2.8, -i * 5 - 3 + 1.26);
    scene.add(window1);
  }

  // Silhouette féminine simplifiée
  const bodyMat = new THREE.MeshStandardMaterial({ color: PALETTE.terracotta, roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.3, 10), bodyMat);
  body.position.set(-0.4, 0.9, -1.5);
  scene.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), bodyMat);
  head.position.set(-0.4, 1.75, -1.5);
  scene.add(head);
}
