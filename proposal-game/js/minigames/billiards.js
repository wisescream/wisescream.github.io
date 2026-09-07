import { $, show, hide, clamp } from '../utils.js';
import { gameState } from '../gameState.js';

const OPTIMAL_POWER = 0.8;
const SUCCESS_THRESHOLD = 0.6;

/**
 * Runs the billiards minigame state machine (see GDD section 2.1).
 * Resolves with 'win' | 'lose' once all shots are resolved.
 */
export function runBilliards() {
  return new Promise((resolve) => {
    const panel = $('billiards-panel');
    const shotsLeftEl = $('shots-left');
    const angleRow = $('angle-row');
    const powerRow = $('power-row');
    const startAimBtn = $('btn-start-aim');
    const confirmAngleBtn = $('btn-confirm-angle');
    const takeShotBtn = $('btn-take-shot');
    const angleSlider = $('angle-slider');
    const powerFill = $('power-fill');

    let shotsRemaining = 3;
    let playerScore = 0;
    let rivalScore = 0;
    let currentAngle = 0;
    let currentPower = 0;
    let powerDir = 1;
    let powerRAF = null;

    shotsLeftEl.textContent = shotsRemaining;
    show(panel);
    hide(angleRow);
    hide(powerRow);
    show(startAimBtn);

    startAimBtn.onclick = () => {
      hide(startAimBtn);
      show(angleRow);
      angleSlider.value = 0;
    };

    confirmAngleBtn.onclick = () => {
      currentAngle = clamp(parseFloat(angleSlider.value), -45, 45);
      hide(angleRow);
      show(powerRow);
      startPowerOscillation();
    };

    function startPowerOscillation() {
      currentPower = 0;
      powerDir = 1;
      const speed = 1.4; // unités / seconde
      let last = performance.now();
      function step(now) {
        const dt = (now - last) / 1000;
        last = now;
        currentPower += powerDir * speed * dt;
        if (currentPower >= 1) { currentPower = 1; powerDir = -1; }
        if (currentPower <= 0) { currentPower = 0; powerDir = 1; }
        powerFill.style.width = `${currentPower * 100}%`;
        powerRAF = requestAnimationFrame(step);
      }
      powerRAF = requestAnimationFrame(step);
    }

    takeShotBtn.onclick = () => {
      cancelAnimationFrame(powerRAF);
      resolveShot();
    };

    function resolveShot() {
      const accuracy = 1 - Math.abs(currentPower - OPTIMAL_POWER);
      const success = accuracy > SUCCESS_THRESHOLD;
      if (success) playerScore += 1; else rivalScore += 1;
      shotsRemaining -= 1;
      shotsLeftEl.textContent = Math.max(shotsRemaining, 0);

      hide(powerRow);

      if (shotsRemaining > 0) {
        setTimeout(() => {
          show(startAimBtn);
        }, 400);
      } else {
        gameState.billiards.playerScore = playerScore;
        gameState.billiards.rivalScore = rivalScore;
        const outcome = playerScore >= rivalScore ? 'win' : 'lose';
        gameState.billiards.outcome = outcome;
        setTimeout(() => {
          hide(panel);
          resolve(outcome);
        }, 500);
      }
    }
  });
}
