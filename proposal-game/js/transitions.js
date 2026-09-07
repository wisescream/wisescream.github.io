import { $, delay } from './utils.js';

/** Zellige-motif wipe transition between acts. */
export async function zelligeTransition(duringCallback) {
  const overlay = $('transition-overlay');
  overlay.classList.add('active');
  await delay(520);
  if (duringCallback) await duringCallback();
  await delay(200);
  overlay.classList.remove('active');
  await delay(520);
}
