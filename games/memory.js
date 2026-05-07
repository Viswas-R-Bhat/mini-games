// /games/memory.js — ENGINE ONLY — 5×4 Memory Match, 600ms reveal, hard mode.
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard }         from '../lib/leaderboard.js';
import { cardSets }                from '../data/memory.js';

const COLS = 5, ROWS = 4, TOTAL_PAIRS = 10;
const REVEAL_MS = 600;

let player = null;
let cards = [];       // { id, pairId, text, side, flipped, matched }
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let timerSecs = 0;
let timerRunning = false;
let timerInterval = null;
let locked = false;
let finished = false;

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();
  setupGame();
  attachListeners();
});

function setupGame() {
  const set = cardSets[Math.floor(Math.random() * cardSets.length)];
  document.getElementById('theme-name').textContent = set.title;

  const raw = [];
  set.pairs.forEach(p => {
    raw.push({ pairId: p.id, text: p.a, side: 'a' });
    raw.push({ pairId: p.id, text: p.b, side: 'b' });
  });

  // Shuffle
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [raw[i], raw[j]] = [raw[j], raw[i]];
  }

  cards = raw.map((c, idx) => ({ ...c, idx, flipped: false, matched: false }));
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

  cards.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'mem-card';
    div.dataset.idx = i;
    div.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-card-front">?</div>
        <div class="mem-card-back">${escHtml(card.text)}</div>
      </div>`;
    div.addEventListener('click', () => onCardClick(i));
    grid.appendChild(div);
  });
}

function onCardClick(idx) {
  if (locked || finished) return;
  const card = cards[idx];
  if (card.flipped || card.matched) return;

  startTimer();
  flipCard(idx, true);
  flippedCards.push(idx);

  if (flippedCards.length === 2) {
    moves++;
    document.getElementById('move-count').textContent = moves;
    locked = true;

    const [a, b] = flippedCards;
    if (cards[a].pairId === cards[b].pairId && cards[a].side !== cards[b].side) {
      // Match!
      cards[a].matched = true;
      cards[b].matched = true;
      matchedCount++;
      document.getElementById('pair-count').textContent = matchedCount;

      markMatched(a);
      markMatched(b);
      flippedCards = [];
      locked = false;

      if (matchedCount >= TOTAL_PAIRS) endGame();
    } else {
      // Mismatch — reveal briefly then flip back
      setTimeout(() => {
        flipCard(a, false);
        flipCard(b, false);
        flippedCards = [];
        locked = false;
      }, REVEAL_MS);
    }
  }
}

function flipCard(idx, show) {
  cards[idx].flipped = show;
  const el = document.querySelectorAll('.mem-card')[idx];
  if (show) el.classList.add('flipped');
  else el.classList.remove('flipped');
}

function markMatched(idx) {
  const el = document.querySelectorAll('.mem-card')[idx];
  el.classList.add('matched');
}

// Timer
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSecs++;
    document.getElementById('timer').textContent = formatTime(timerSecs);
  }, 1000);
}

function formatTime(s) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

// End game
async function endGame() {
  if (finished) return;
  finished = true;
  clearInterval(timerInterval);

  const score = Math.max(0, Math.floor((matchedCount / TOTAL_PAIRS) * 1000 - timerSecs));

  document.getElementById('res-pairs').textContent = `${matchedCount}/${TOTAL_PAIRS}`;
  document.getElementById('res-moves').textContent = moves;
  document.getElementById('res-time').textContent = formatTime(timerSecs);
  document.getElementById('res-score').textContent = score;
  document.getElementById('results-section').hidden = false;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  await submitScore({
    usn: player.usn, game: 'memory', score,
    meta: { pairs: matchedCount, moves, timeTaken: timerSecs },
  });
}

function attachListeners() {
  document.getElementById('view-lb-btn').addEventListener('click', showLeaderboard);
  document.getElementById('play-again-btn').addEventListener('click', () => location.reload());
}

async function showLeaderboard() {
  const section = document.getElementById('lb-section');
  const loading = document.getElementById('lb-loading');
  section.hidden = false;
  loading.hidden = false;
  section.scrollIntoView({ behavior: 'smooth' });

  const rows = await loadLeaderboard('memory');
  loading.hidden = true;
  const tbody = document.getElementById('lb-body');

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">No scores yet.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(row => `
    <tr class="${row.usn === player.usn ? 'lb-mine' : ''}">
      <td class="lb-rank">${row.rank}</td>
      <td class="lb-name">${escHtml(row.username)}</td>
      <td class="lb-usn">${escHtml(row.usn)}</td>
      <td class="lb-score">${row.score}</td>
    </tr>`).join('');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
