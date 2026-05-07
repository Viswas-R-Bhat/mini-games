import { initPlayer, submitScore, getAttemptInfo } from '../lib/submitScore.js';

const TOTAL_ROUNDS = 7;
const MIN_DELAY = 1500;
const MAX_DELAY = 4500;
const FAKEOUT_CHANCE = 0.3;
const PENALTY_MS = 1000;
const FAKEOUT_HOLD_MS = 800;
const BASE_ATTEMPTS = 3;

let player = null;
let round = 0;
let times = [];
let phase = 'idle';
let delayTimeout = null;
let readyStamp = 0;
let gameFinished = false;
let attemptScores = [];
let attemptInfo = null;

let targetArea, statusText, roundEl, lastTimeEl, avgTimeEl;
let resultsSection, resAvg, resScore, resBest, resFastest;
let playAgainBtn, instructionEl, attemptDisplay;

document.addEventListener('DOMContentLoaded', async () => {
  grabDOMRefs();
  player = await initPlayer();
  attemptInfo = await getAttemptInfo(player.team_name, 'reaction', BASE_ATTEMPTS);
  await loadPreviousAttempts();

  if (attemptInfo.remaining <= 0) {
    showNoAttemptsLeft();
    return;
  }
  attachListeners();
  showInstruction();
  updateAttemptDisplay();
});

function grabDOMRefs() {
  targetArea = document.getElementById('target-area');
  statusText = document.getElementById('status-text');
  roundEl = document.getElementById('round-num');
  lastTimeEl = document.getElementById('last-time');
  avgTimeEl = document.getElementById('avg-time');
  resultsSection = document.getElementById('results-section');
  resAvg = document.getElementById('res-avg');
  resScore = document.getElementById('res-score');
  resBest = document.getElementById('res-best');
  resFastest = document.getElementById('res-fastest');
  playAgainBtn = document.getElementById('play-again-btn');
  instructionEl = document.getElementById('instruction');
  attemptDisplay = document.getElementById('attempt-display');
}

async function loadPreviousAttempts() {
  // Load from localStorage first (instant, reliable)
  const cacheKey = `reaction_scores_${player.team_name}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    if (cached.length) attemptScores = cached;
  } catch {}

  // Then try Supabase — only update if it has MORE data
  try {
    const { supabase } = await import('../lib/supabaseClient.js');
    const { data } = await supabase.from('attempt_logs').select('score')
      .eq('team_name', player.team_name).eq('game', 'reaction')
      .order('created_at', { ascending: true });

    const supaScores = (data || []).map(r => r.score);
    if (supaScores.length >= attemptScores.length) {
      attemptScores = supaScores;
    }
    localStorage.setItem(cacheKey, JSON.stringify(attemptScores));
  } catch (e) {
    console.warn('[reaction] Supabase load failed, using cached scores');
  }
}

function updateAttemptDisplay() {
  if (!attemptDisplay) return;
  attemptDisplay.textContent = `${Math.min(attemptScores.length + 1, attemptInfo.allowed)} / ${attemptInfo.allowed}`;
}

function showNoAttemptsLeft() {
  targetArea.className = 'target-area state-idle';
  const avg = attemptScores.length ? Math.round(attemptScores.reduce((a,b) => a+b, 0) / attemptScores.length) : 0;
  statusText.textContent = 'ALL ATTEMPTS USED';
  resultsSection.hidden = false;
  resAvg.textContent = '—';
  resScore.textContent = avg + ' (avg all)';
  resFastest.textContent = '—';
  resBest.textContent = avg;
  if (playAgainBtn) playAgainBtn.style.display = 'none';
  if (instructionEl) instructionEl.hidden = true;
}

function attachListeners() {
  targetArea.addEventListener('click', handleClick);
  targetArea.addEventListener('contextmenu', e => e.preventDefault());
  playAgainBtn.addEventListener('click', restartGame);
}

function showInstruction() {
  phase = 'idle';
  targetArea.className = 'target-area state-idle';
  statusText.textContent = 'CLICK TO START';
  instructionEl.hidden = false;
}

function handleClick() {
  if (gameFinished) return;
  switch (phase) {
    case 'idle':
      instructionEl.hidden = true;
      startRound();
      break;
    case 'waiting':
      clearTimeout(delayTimeout);
      phase = 'penalty';
      targetArea.className = 'target-area state-penalty';
      statusText.textContent = 'TOO EARLY! +1000ms PENALTY';
      times.push(PENALTY_MS);
      updateHUD();
      setTimeout(() => startRound(), 1500);
      break;
    case 'fakeout':
      phase = 'penalty';
      targetArea.className = 'target-area state-penalty';
      statusText.textContent = 'FAKE-OUT! +1000ms PENALTY';
      times.push(PENALTY_MS);
      updateHUD();
      setTimeout(() => startRound(), 1500);
      break;
    case 'ready':
      const reactionTime = performance.now() - readyStamp;
      phase = 'clicked';
      targetArea.className = 'target-area state-clicked';
      statusText.textContent = `${Math.round(reactionTime)}ms`;
      times.push(reactionTime);
      updateHUD();
      if (times.length >= TOTAL_ROUNDS) setTimeout(() => endGame(), 1000);
      else setTimeout(() => startRound(), 1200);
      break;
    case 'penalty':
    case 'clicked':
      break;
  }
}

function startRound() {
  if (times.length >= TOTAL_ROUNDS) { endGame(); return; }
  round = times.length + 1;
  roundEl.textContent = `${round}/${TOTAL_ROUNDS}`;
  phase = 'waiting';
  targetArea.className = 'target-area state-waiting';
  statusText.textContent = 'WAIT FOR GREEN...';

  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  const isFakeout = Math.random() < FAKEOUT_CHANCE && round > 1;

  delayTimeout = setTimeout(() => {
    if (isFakeout) {
      phase = 'fakeout';
      targetArea.className = 'target-area state-fakeout';
      statusText.textContent = 'WAIT!';
      setTimeout(() => {
        if (phase === 'fakeout') {
          targetArea.className = 'target-area state-waiting';
          statusText.textContent = 'WAIT FOR GREEN...';
          phase = 'waiting';
          delayTimeout = setTimeout(() => showTarget(), 800 + Math.random() * 2000);
        }
      }, FAKEOUT_HOLD_MS);
    } else {
      showTarget();
    }
  }, delay);
}

function showTarget() {
  phase = 'ready';
  readyStamp = performance.now();
  targetArea.className = 'target-area state-ready';
  statusText.textContent = 'CLICK NOW!';
}

function updateHUD() {
  if (times.length > 0) {
    lastTimeEl.textContent = `${Math.round(times[times.length - 1])}ms`;
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    avgTimeEl.textContent = `${Math.round(avg)}ms`;
  }
}

async function endGame() {
  if (gameFinished) return;
  gameFinished = true;
  clearTimeout(delayTimeout);

  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const fastest = Math.round(Math.min(...times));
  const score = Math.max(0, Math.floor(1000 - avg));

  attemptScores.push(score);
  // Cache to localStorage immediately
  localStorage.setItem(`reaction_scores_${player.team_name}`, JSON.stringify(attemptScores));
  // Final score = average of all attempts
  const totalAvg = Math.round(attemptScores.reduce((a,b) => a+b, 0) / attemptScores.length);

  targetArea.className = 'target-area state-idle';
  statusText.textContent = 'GAME OVER';

  resultsSection.hidden = false;
  resAvg.textContent = `${avg}ms`;
  resScore.textContent = score;
  resFastest.textContent = `${fastest}ms`;
  resBest.textContent = `${totalAvg} (avg ${attemptScores.length} attempts)`;
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  await submitScore({
    usn: player.team_name, game: 'reaction', score: totalAvg,
    meta: { avgMs: avg, fastestMs: fastest, rounds: TOTAL_ROUNDS, times, attemptScores: [...attemptScores] },
  });

  attemptInfo = await getAttemptInfo(player.team_name, 'reaction', BASE_ATTEMPTS);
  updateAttemptDisplay();
  if (attemptInfo.remaining <= 0 && playAgainBtn) playAgainBtn.style.display = 'none';
}

async function restartGame() {
  attemptInfo = await getAttemptInfo(player.team_name, 'reaction', BASE_ATTEMPTS);
  if (attemptInfo.remaining <= 0) { showNoAttemptsLeft(); return; }

  round = 0; times = []; phase = 'idle'; gameFinished = false;
  clearTimeout(delayTimeout);
  roundEl.textContent = '0/7';
  lastTimeEl.textContent = '—';
  avgTimeEl.textContent = '—';
  resultsSection.hidden = true;
  showInstruction();
  updateAttemptDisplay();
}
