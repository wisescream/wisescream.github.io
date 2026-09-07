import { $, show, hide } from '../utils.js';
import { playDialogue } from '../dialogue.js';
import { gameState } from '../gameState.js';

/**
 * Runs the distraction QTE followed by the search-the-counter sequence
 * (see GDD section 2.2). No hard fail state — it loops narratively until
 * the player finds the right zone.
 */
export async function runDistractionAndSearch() {
  await runQte();
  await runSearch();
  gameState.distraction.searchDone = true;
}

function runQte() {
  return new Promise((resolve) => {
    const panel = $('distraction-panel');
    const marker = $('qte-marker');
    const hitCountEl = $('qte-hit-count');
    const REQUIRED = 2;
    const WINDOW_MS = 6000; // fenêtre élargie pour un tap confortable au doigt
    let hits = 0;
    let raf = null;
    let dir = 1;
    let pos = 0; // 0..100
    const speed = 55; // %/s

    show(panel);
    hitCountEl.textContent = '0';

    let last = performance.now();
    function step(now) {
      const dt = (now - last) / 1000;
      last = now;
      pos += dir * speed * dt;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      marker.style.left = `${pos}%`;
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    const timeout = setTimeout(finish, WINDOW_MS);

    panel.onclick = (e) => {
      if (e.target.closest('#qte-track') === null && e.target.id !== 'distraction-panel') return;
      // zone de succès : 43%-57%
      if (pos >= 40 && pos <= 60) {
        hits += 1;
        hitCountEl.textContent = String(hits);
        if (hits >= REQUIRED) finish();
      }
    };

    function finish() {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
      panel.onclick = null;
      hide(panel);
      gameState.distraction.qteHits = hits;
      resolve();
    }
  });
}

function runSearch() {
  return new Promise(async (resolve) => {
    const panel = $('search-panel');
    const zonesRow = $('search-zones');
    const timerFill = $('search-timer-fill');
    const zones = [
      { id: 'locker', label: 'Casier' },
      { id: 'counter_drawer', label: 'Tiroir du comptoir' },
      { id: 'bag_silhouette', label: 'Sac entrouvert' },
    ];
    const correctZone = 'bag_silhouette';

    async function attempt() {
      show(panel);
      zonesRow.innerHTML = '';
      let windowMs = gameState.distraction.qteHits >= 2 ? 4500 : 2500;
      let elapsed = 0;
      let resolved = false;

      zones.forEach((z) => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.textContent = z.label;
        card.onclick = () => {
          if (resolved) return;
          if (z.id === correctZone) {
            resolved = true;
            finishAttempt(true);
          } else {
            card.style.opacity = '0.4';
          }
        };
        zonesRow.appendChild(card);
      });

      const tickMs = 100;
      const timer = setInterval(() => {
        elapsed += tickMs;
        timerFill.style.width = `${Math.max(0, 100 - (elapsed / windowMs) * 100)}%`;
        if (elapsed >= windowMs && !resolved) {
          resolved = true;
          finishAttempt(false);
        }
      }, tickMs);

      async function finishAttempt(success) {
        clearInterval(timer);
        hide(panel);
        if (success) {
          resolve();
        } else {
          await playDialogue([
            { speaker: 'Karim', text: "Eh, eh, attendez, j'ai encore une histoire à vous raconter—" },
          ]);
          attempt();
        }
      }
    }

    attempt();
  });
}
