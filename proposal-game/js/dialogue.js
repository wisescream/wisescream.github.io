import { $, show, hide } from './utils.js';

const box = () => $('dialogue-box');
const speakerEl = () => $('dialogue-speaker');
const textEl = () => $('dialogue-text');
const choicesEl = () => $('dialogue-choices');
const nextBtn = () => $('dialogue-next');

/**
 * Plays a sequence of dialogue lines.
 * line = { speaker: string, text: string, choices?: string[] }
 * Returns a promise resolving with the array of chosen choice indices (or [] if none).
 */
export function playDialogue(lines) {
  return new Promise((resolve) => {
    show(box());
    const chosen = [];
    let i = 0;

    function renderLine() {
      const line = lines[i];
      speakerEl().textContent = line.speaker || '';
      textEl().textContent = line.text || '';
      choicesEl().innerHTML = '';

      if (line.choices && line.choices.length) {
        hide(nextBtn());
        line.choices.forEach((choiceText, idx) => {
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.textContent = choiceText;
          btn.onclick = () => {
            chosen.push(idx);
            advance();
          };
          choicesEl().appendChild(btn);
        });
      } else {
        show(nextBtn());
        nextBtn().onclick = advance;
      }
    }

    function advance() {
      i += 1;
      if (i >= lines.length) {
        hide(box());
        nextBtn().onclick = null;
        resolve(chosen);
        return;
      }
      renderLine();
    }

    renderLine();
  });
}
