import { $, show, hide, dist2D } from '../utils.js';
import { gameState } from '../gameState.js';

const ANCHOR_POSITIONS = [
  { x: 0.20, y: 0.30 }, { x: 0.50, y: 0.18 }, { x: 0.80, y: 0.30 },
  { x: 0.20, y: 0.65 }, { x: 0.50, y: 0.78 }, { x: 0.80, y: 0.65 },
];
const SNAP_RADIUS_PX = 34;

/**
 * Drag & drop candle placement onto fixed anchor points (GDD section 2.3).
 * Resolves once all anchors are filled.
 */
export function runCandlePlacement() {
  return new Promise((resolve) => {
    const panel = $('candle-panel');
    const stage = $('candle-stage');
    const tray = $('candle-tray');
    const progressEl = $('candles-placed');

    stage.querySelectorAll('.anchor-point').forEach((n) => n.remove());
    tray.querySelectorAll('.candle-drag').forEach((n) => n.remove());

    const anchors = ANCHOR_POSITIONS.map((pos, i) => {
      const el = document.createElement('div');
      el.className = 'anchor-point';
      el.dataset.index = String(i);
      stage.appendChild(el);
      return { ...pos, el, filled: false };
    });

    let placedCount = 0;
    progressEl.textContent = '0';

    function layoutAnchors() {
      const rect = stage.getBoundingClientRect();
      anchors.forEach((a) => {
        a.el.style.left = `${a.x * rect.width}px`;
        a.el.style.top = `${a.y * rect.height}px`;
      });
    }

    ANCHOR_POSITIONS.forEach((_, i) => {
      const candle = document.createElement('div');
      candle.className = 'candle-drag';
      candle.dataset.id = `candle-${i}`;
      tray.appendChild(candle);
      makeDraggable(candle);
    });

    show(panel);
    requestAnimationFrame(layoutAnchors);
    window.addEventListener('resize', layoutAnchors);

    function makeDraggable(el) {
      let dragging = false;
      let offsetX = 0, offsetY = 0;

      el.addEventListener('pointerdown', (e) => {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        const r = el.getBoundingClientRect();
        offsetX = e.clientX - r.left;
        offsetY = e.clientY - r.top;
        el.style.position = 'fixed';
        el.style.zIndex = 200;
      });

      el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        el.style.left = `${e.clientX - offsetX}px`;
        el.style.top = `${e.clientY - offsetY}px`;
      });

      el.addEventListener('pointerup', (e) => {
        if (!dragging) return;
        dragging = false;
        tryPlace(el, e.clientX, e.clientY);
      });
    }

    function tryPlace(candleEl, clientX, clientY) {
      let nearest = null;
      let nearestDist = Infinity;
      anchors.forEach((a) => {
        if (a.filled) return;
        const r = a.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = dist2D(clientX, clientY, cx, cy);
        if (d < nearestDist) { nearestDist = d; nearest = a; }
      });

      if (nearest && nearestDist <= SNAP_RADIUS_PX * 2) {
        nearest.filled = true;
        nearest.el.classList.add('filled');
        candleEl.remove();
        placedCount += 1;
        progressEl.textContent = String(placedCount);
        gameState.candlesPlaced = placedCount;
        if (placedCount >= ANCHOR_POSITIONS.length) {
          window.removeEventListener('resize', layoutAnchors);
          setTimeout(() => { hide(panel); resolve(); }, 500);
        }
      } else {
        // retour au plateau — pas de pénalité
        candleEl.style.position = 'relative';
        candleEl.style.left = '0';
        candleEl.style.top = '0';
        tray.appendChild(candleEl);
      }
    }
  });
}
