export const gameState = {
  currentAct: 0,
  outfit: null,        // 'casual' | 'chic' | 'classic'
  purchasedItem: null, // 'flowers' | 'jewelry' (whichever wasn't already implied)
  flowerChoice: null,  // 'roses' | 'orangeBlossom' | 'wildBouquet'
  billiards: {
    playerScore: 0,
    rivalScore: 0,
    outcome: null,     // 'win' | 'lose'
  },
  distraction: {
    qteHits: 0,
    searchDone: false,
  },
  candlesPlaced: 0,
  candlesTotal: 6,
  clockMinutesElapsed: 0, // advances the HUD clock as acts progress
};

const CLOCK_START_HOUR = 18;
const CLOCK_START_MIN = 40;

export function formatClock() {
  const totalMin = CLOCK_START_HOUR * 60 + CLOCK_START_MIN + gameState.clockMinutesElapsed;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function advanceClock(minutes) {
  gameState.clockMinutesElapsed += minutes;
}
