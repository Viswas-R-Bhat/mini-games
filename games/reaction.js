// /games/reaction.js
// ENGINE ONLY — Reaction Time: 7 rounds, fake-outs, tight timing.

import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard }         from '../lib/leaderboard.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS    = 7;
const MIN_DELAY       = 1500;   // ms before target can appear
const MAX_DELAY       = 4500;
const FAKEOUT_CHANCE  = 0.3;    // 30% chance of a fake-out round
const PENALTY_MS      = 1000;   // added to average for early click
const FAKEOUT_HOLD_MS = 800;    // how long the fake-out flash stays

// ── State ─────────────────────────────────────────────────────────────────────
let player       = null;
let round        = 0;
let times        = [];       // reaction times per round (ms)
let phase        = 'idle';   // idle | waiting | fakeout | ready | clicked | penalty
let delayTimeout = null;
let readyStamp   = 0;
let gameFinished = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
let targetArea, statusText, roundEl, lastTimeEl, avgTimeEl;
let resultsSection, resAvg, resScore, resBest, resFastest;
let lbSection, lbBody, lbLoading;
let viewLbBtn, playAgainBtn, instructionEl;

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  grabDOMRefs();
  player = await initPlayer();
  attachListeners();
  showInstruction();
});

function grabDOMRefs() {
  targetArea     = document.getElementById('target-area');
  statusText     = document.getElementById('status-text');
  roundEl        = document.getElementById('round-num');
  lastTimeEl     = document.getElementById('last-time');
  avgTimeEl      = document.getElementById('avg-time');
  resultsSection = document.getElementById('results-section');
  resAvg         = document.getElementById('res-avg');
  resScore       = document.getElementById('res-score');
  resBest        = document.getElementById('res-best');
  resFastest     = document.getElementById('res-fastest');
  lbSection      = document.getElementById('lb-section');
  lbBody         = document.getElementById('lb-body');
  lbLoading      = document.getElementById('lb-loading');
  viewLbBtn      = document.getElementById('view-lb-btn');
  playAgainBtn   = document.getElementById('play-again-btn');
  instructionEl  = document.getElementById('instruction');
}

function attachListeners() {
  targetArea.addEventListener('click', handleClick);
  // Prevent right-click / context menu on the target
  targetArea.addEventListener('contextmenu', e => e.preventDefault());
  viewLbBtn.addEventListener('click', showLeaderboard);
  playAgainBtn.addEventListener('click', restartGame);
}

// ── Game Flow ─────────────────────────────────────────────────────────────────
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
      // Clicked too early
      clearTimeout(delayTimeout);
      phase = 'penalty';
      targetArea.className = 'target-area state-penalty';
      statusText.textContent = 'TOO EARLY! +1000ms PENALTY';
      times.push(PENALTY_MS);
      updateHUD();
      setTimeout(() => startRound(), 1500);
      break;

    case 'fakeout':
      // Clicked on fake-out — penalty
      phase = 'penalty';
      targetArea.className = 'target-area state-penalty';
      statusText.textContent = 'FAKE-OUT! +1000ms PENALTY';
      times.push(PENALTY_MS);
      updateHUD();
      setTimeout(() => startRound(), 1500);
      break;

    case 'ready':
      // Valid click!
      const reactionTime = performance.now() - readyStamp;
      phase = 'clicked';
      targetArea.className = 'target-area state-clicked';
      statusText.textContent = `${Math.round(reactionTime)}ms`;
      times.push(reactionTime);
      updateHUD();
      if (times.length >= TOTAL_ROUNDS) {
        setTimeout(() => endGame(), 1000);
      } else {
        setTimeout(() => startRound(), 1200);
      }
      break;

    case 'penalty':
    case 'clicked':
      // Ignore rapid clicks during transition
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
      // Show a brief flash (different color) — fake-out
      phase = 'fakeout';
      targetArea.className = 'target-area state-fakeout';
      statusText.textContent = 'WAIT!';
      setTimeout(() => {
        if (phase === 'fakeout') {
          // Player didn't click the fake — reward them, go to real
          targetArea.className = 'target-area state-waiting';
          statusText.textContent = 'WAIT FOR GREEN...';
          phase = 'waiting';
          // Now schedule the real target
          const realDelay = 800 + Math.random() * 2000;
          delayTimeout = setTimeout(() => showTarget(), realDelay);
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

// ── End Game ──────────────────────────────────────────────────────────────────
async function endGame() {
  if (gameFinished) return;
  gameFinished = true;
  clearTimeout(delayTimeout);

  const avg     = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const fastest = Math.round(Math.min(...times));
  const score   = Math.max(0, Math.floor(1000 - avg));

  targetArea.className = 'target-area state-idle';
  statusText.textContent = 'GAME OVER';

  // Show results
  resultsSection.hidden = false;
  resAvg.textContent     = `${avg}ms`;
  resScore.textContent   = score;
  resFastest.textContent = `${fastest}ms`;
  resBest.textContent    = '—';
  resultsSection.scrollIntoView({ behavior: 'smooth' });

  // Submit score
  await submitScore({
    usn:   player.usn,
    game:  'reaction',
    score: score,
    meta:  { avgMs: avg, fastestMs: fastest, rounds: TOTAL_ROUNDS, times },
  });

  // Fetch personal best
  loadLeaderboard('reaction').then(rows => {
    const mine = rows.find(r => r.usn === player.usn);
    if (mine) resBest.textContent = mine.score;
  });
}

function restartGame() {
  round = 0;
  times = [];
  phase = 'idle';
  gameFinished = false;
  clearTimeout(delayTimeout);

  roundEl.textContent    = '0/7';
  lastTimeEl.textContent = '—';
  avgTimeEl.textContent  = '—';
  resultsSection.hidden  = true;
  lbSection.hidden       = true;

  showInstruction();
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
async function showLeaderboard() {
  lbSection.hidden  = false;
  lbLoading.hidden  = false;
  lbBody.innerHTML  = '';
  viewLbBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const rows = await loadLeaderboard('reaction');
  lbLoading.hidden = true;

  if (!rows.length) {
    lbBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">No scores yet.</td></tr>';
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');
    if (row.usn === player.usn) tr.classList.add('lb-mine');
    tr.innerHTML = `
      <td class="lb-rank">${row.rank}</td>
      <td class="lb-name">${escHtml(row.username)}</td>
      <td class="lb-usn">${escHtml(row.usn)}</td>
      <td class="lb-score">${row.score}</td>
    `;
    lbBody.appendChild(tr);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
