export const $ = (id) => document.getElementById(id);

export function lerp(a, b, t) { return a + (b - a) * t; }

export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

export function randRange(min, max) { return min + Math.random() * (max - min); }

export function show(el) { el.classList.remove('hidden'); }
export function hide(el) { el.classList.add('hidden'); }

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simple point-inside-circle test used by candle placement snapping. */
export function dist2D(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}
