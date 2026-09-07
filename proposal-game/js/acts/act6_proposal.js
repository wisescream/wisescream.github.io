import * as THREE from 'three';
import { PALETTE } from '../sceneRig.js';
import { $, show, hide, delay } from '../utils.js';
import { playDialogue } from '../dialogue.js';

export async function runAct6(rig) {
  rig.clear();
  const lights = rig.applyLighting('proposalFinal');
  rig.camera.position.set(0, 2.2, 5);
  rig.camera.lookAt(0, 1.2, 0);

  const { reda, box } = buildFinalScene(rig.scene);

  await playDialogue([
    { speaker: '', text: "Le décor qu'il a préparé. Les bougies. Elle, face à lui." },
  ]);

  // Caméra cinématique scriptée — dolly lent, aucun contrôle joueur
  await scriptedDolly(rig, { x: 0, y: 2.2, z: 5 }, { x: 0.8, y: 1.3, z: 1.6 }, 3.5);

  // Reda s'agenouille (anim simple : translation + rotation)
  await kneel(reda, rig);

  // Ouverture de la boîte — seul moment où elle est ouverte
  box.children[1].visible = true; // le couvercle "ouvert" remplace le fermé

  await tapToSayWords();

  if (lights && lights.candles) {
    lights.candles.intensity = 2.2;
  }

  await playDialogue([
    { speaker: '', text: "..." },
    { speaker: '', text: "Un silence. Puis un rire, les larmes aux yeux. Elle dit oui." },
  ]);

  await delay(600);
  await showEnding(rig);
}

function tapToSayWords() {
  return new Promise((resolve) => {
    const el = $('proposal-tap');
    show(el);
    $('btn-say-words').onclick = () => {
      hide(el);
      resolve();
    };
  });
}

function scriptedDolly(rig, from, to, duration) {
  return new Promise((resolve) => {
    let t = 0;
    function step(dt) {
      t += dt;
      const p = Math.min(t / duration, 1);
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      rig.camera.position.set(
        from.x + (to.x - from.x) * ease,
        from.y + (to.y - from.y) * ease,
        from.z + (to.z - from.z) * ease
      );
      rig.camera.lookAt(0, 1.2, 0);
      if (p >= 1) {
        rig._animateCallbacks = rig._animateCallbacks.filter((cb) => cb !== step);
        resolve();
      }
    }
    rig.onFrame(step);
  });
}

function kneel(reda, rig) {
  return new Promise((resolve) => {
    let t = 0;
    const duration = 1.2;
    const startY = reda.position.y;
    function step(dt) {
      t += dt;
      const p = Math.min(t / duration, 1);
      reda.position.y = startY - 0.35 * p;
      reda.rotation.x = 0.25 * p;
      if (p >= 1) {
        rig._animateCallbacks = rig._animateCallbacks.filter((cb) => cb !== step);
        resolve();
      }
    }
    rig.onFrame(step);
  });
}

async function showEnding(rig) {
  const dataUrl = rig.renderer.domElement.toDataURL('image/png');
  $('polaroid-img').src = dataUrl;
  const ending = $('ending-screen');
  show(ending);
  $('btn-restart').onclick = () => window.location.reload();
}

function buildFinalScene(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a2038, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Bougies allumées
  for (let i = -2; i <= 2; i++) {
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: PALETTE.cream })
    );
    candle.position.set(i * 0.6, 0.15, -1.5);
    scene.add(candle);
    const flame = new THREE.PointLight(0xffcf9e, 0.4, 2);
    flame.position.set(i * 0.6, 0.35, -1.5);
    scene.add(flame);
  }

  // Reda (silhouette)
  const redaMat = new THREE.MeshStandardMaterial({ color: PALETTE.bleuNuit, roughness: 0.6 });
  const reda = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.2, 10), redaMat);
  body.position.y = 0.9;
  reda.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), redaMat);
  head.position.y = 1.7;
  reda.add(head);
  reda.position.set(0.8, 0, 0.4);
  scene.add(reda);

  // Elle (silhouette, immobile)
  const herMat = new THREE.MeshStandardMaterial({ color: PALETTE.terracotta, roughness: 0.6 });
  const her = new THREE.Group();
  const herBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 1.3, 10), herMat);
  herBody.position.y = 0.95;
  her.add(herBody);
  const herHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), herMat);
  herHead.position.y = 1.75;
  her.add(herHead);
  her.position.set(0.8, 0, -0.8);
  scene.add(her);

  // Boîte à bague — fermée (visible) / ouverte (cachée jusqu'au tap)
  const boxGroup = new THREE.Group();
  const closedLid = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.06, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 })
  );
  closedLid.visible = true;
  const openLid = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.02, 0.12),
    new THREE.MeshStandardMaterial({ color: PALETTE.or, emissive: PALETTE.or, emissiveIntensity: 0.6 })
  );
  openLid.visible = false;
  boxGroup.add(closedLid, openLid);
  boxGroup.position.set(0.8, 1.1, 0.55);
  scene.add(boxGroup);

  return { reda, her, box: boxGroup };
}
