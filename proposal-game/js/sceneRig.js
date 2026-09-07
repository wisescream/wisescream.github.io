import * as THREE from 'three';

const PALETTE = {
  ocre: 0xC97A3D,
  terracotta: 0xB5563A,
  bleuNuit: 0x1B2A4A,
  or: 0xD9A441,
  neonMagenta: 0xC23B6B,
  neonCyan: 0x2FA8A0,
  cream: 0xF3E7D3,
  ink: 0x17120C,
};

export { PALETTE };

export class SceneRig {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false; // budget mobile : pas d'ombres dynamiques coûteuses
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.set(0, 1.6, 5);
    this.scene = new THREE.Scene();
    this._resize();
    window.addEventListener('resize', () => this._resize());

    this._animateCallbacks = [];
    this._clock = new THREE.Clock();
    this._loop();
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  clear() {
    while (this.scene.children.length) {
      const obj = this.scene.children.pop();
      this._disposeDeep(obj);
    }
    this._animateCallbacks = [];
  }

  _disposeDeep(obj) {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
    if (obj.children) obj.children.slice().forEach((c) => this._disposeDeep(c));
  }

  onFrame(cb) { this._animateCallbacks.push(cb); }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const dt = this._clock.getDelta();
    for (const cb of this._animateCallbacks) cb(dt);
    this.renderer.render(this.scene, this.camera);
  }

  /** Lighting presets matching the style sheet, per act mood. */
  applyLighting(preset) {
    const scene = this.scene;
    const presets = {
      apartment: () => {
        scene.fog = new THREE.Fog(0x2a2018, 6, 22);
        scene.add(new THREE.AmbientLight(0x6b5236, 0.9));
        const key = new THREE.PointLight(0xffcf9e, 1.1, 12);
        key.position.set(1.5, 2.4, 1.5);
        scene.add(key);
      },
      goldenHourStreet: () => {
        scene.fog = new THREE.Fog(0xd99a5c, 8, 40);
        scene.add(new THREE.AmbientLight(0xffb87a, 0.7));
        const sun = new THREE.DirectionalLight(0xffb15c, 1.4);
        sun.position.set(-8, 4, -6);
        scene.add(sun);
        const bounce = new THREE.HemisphereLight(0xffd9a0, 0x6b3f2a, 0.5);
        scene.add(bounce);
      },
      bristol: () => {
        scene.fog = new THREE.Fog(0x140f1a, 5, 20);
        scene.add(new THREE.AmbientLight(0x2a1f33, 0.6));
        const tungsten = new THREE.PointLight(0xffb15c, 1.2, 10);
        tungsten.position.set(0, 3, 0);
        scene.add(tungsten);
        const neonA = new THREE.PointLight(PALETTE.neonMagenta, 1.1, 8);
        neonA.position.set(-3, 1.5, -2);
        scene.add(neonA);
        const neonB = new THREE.PointLight(PALETTE.neonCyan, 1.0, 8);
        neonB.position.set(3, 1.5, -2);
        scene.add(neonB);
        return { neonA, neonB };
      },
      duskSetup: () => {
        scene.fog = new THREE.Fog(0x3a2a4a, 6, 26);
        scene.add(new THREE.AmbientLight(0x6a4f6e, 0.6));
        const dusk = new THREE.DirectionalLight(0xd98a5c, 0.7);
        dusk.position.set(-6, 3, 4);
        scene.add(dusk);
        const candleGlow = new THREE.PointLight(0xffcf9e, 0.0, 6); // intensity raised as candles are lit
        candleGlow.position.set(0, 1, 0);
        scene.add(candleGlow);
        return { candleGlow };
      },
      moonlitWalk: () => {
        scene.fog = new THREE.Fog(0x0e1830, 6, 30);
        scene.add(new THREE.AmbientLight(0x2b3f66, 0.55));
        const moon = new THREE.DirectionalLight(0x9fb4ff, 0.8);
        moon.position.set(4, 8, -4);
        scene.add(moon);
        const warmWindow = new THREE.PointLight(0xffb15c, 0.5, 10);
        warmWindow.position.set(-3, 2, 1);
        scene.add(warmWindow);
      },
      proposalFinal: () => {
        scene.fog = new THREE.Fog(0x0b1226, 4, 22);
        scene.add(new THREE.AmbientLight(0x24345c, 0.4));
        const moon = new THREE.DirectionalLight(0x9fb4ff, 0.6);
        moon.position.set(3, 9, -5);
        scene.add(moon);
        const candles = new THREE.PointLight(0xffcf9e, 1.4, 8);
        candles.position.set(0, 1, 0.5);
        scene.add(candles);
        return { candles };
      },
    };
    return presets[preset] ? presets[preset]() : null;
  }
}
