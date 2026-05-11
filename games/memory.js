// /games/memory.js — 3 levels: Easy → Medium → Hard, sequential unlock.
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { levels } from '../data/memory.js';
import { _d } from '../lib/cipher.js';

const REVEAL_MS = 600;
const LEVEL_ORDER = ['easy', 'medium', 'hard'];
const LEVEL_LABELS = { easy: 'EASY', medium: 'MEDIUM', hard: 'HARD' };
const LEVEL_MULTIPLIER = { easy: 1, medium: 1.5, hard: 2 };

let player = null;
let currentLevel = 'easy';
let levelScores = {};
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let totalPairs = 0;
let moves = 0;
let timerSecs = 0;
let timerRunning = false;
let timerInterval = null;
let locked = false;
let finished = false;

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();
  await loadProgress();
  renderLevelSelect();
});

async function loadProgress() {
  // Try localStorage first as instant fallback
  const cacheKey = `memory_progress_${player.team_name}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    if (cached.levelScores) Object.assign(levelScores, cached.levelScores);
  } catch(e) {}

  // Then fetch from Supabase (source of truth)
  try {
    const { supabase } = await import('../lib/supabaseClient.js');
    const { data } = await supabase.from('attempt_logs').select('meta, score')
      .eq('team_name', player.team_name).eq('game', 'memory')
      .order('created_at', { ascending: true });

    (data || []).forEach(r => {
      if (r.meta?.level) {
        levelScores[r.meta.level] = Math.max(levelScores[r.meta.level] || 0, r.score);
      }
    });
    // Update cache with latest
    localStorage.setItem(cacheKey, JSON.stringify({ levelScores: { ...levelScores } }));
  } catch(e) {
    console.warn('[memory] Supabase load failed, using cached progress', e);
  }
}

function isLevelUnlocked(level) {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx === 0) return true;
  const prevLevel = LEVEL_ORDER[idx - 1];
  return (levelScores[prevLevel] || 0) > 0;
}

function renderLevelSelect() {
  document.getElementById('level-select').hidden = false;
  document.getElementById('game-area').hidden = true;
  document.getElementById('results-section').hidden = true;

  const container = document.getElementById('level-buttons');
  container.innerHTML = '';

  LEVEL_ORDER.forEach(level => {
    const unlocked = isLevelUnlocked(level);
    const score = levelScores[level] || 0;
    const btn = document.createElement('button');
    btn.className = `level-btn ${unlocked ? '' : 'locked'} ${score > 0 ? 'completed' : ''}`;
    btn.innerHTML = `
      <span class="level-name">${LEVEL_LABELS[level]}</span>
      <span class="level-info">${levels[level].cols}×${levels[level].rows} · ${levels[level].totalPairs} pairs</span>
      <span class="level-score">${score > 0 ? '✓ ' + score + ' pts' : unlocked ? 'PLAY →' : '🔒 LOCKED'}</span>
    `;
    if (unlocked) {
      btn.addEventListener('click', () => startLevel(level));
    }
    container.appendChild(btn);
  });
}

function startLevel(level) {
  currentLevel = level;
  const config = levels[level];
  const setList = config.sets;
  const set = setList[Math.floor(Math.random() * setList.length)];

  totalPairs = config.totalPairs;
  matchedCount = 0;
  moves = 0;
  timerSecs = 0;
  timerRunning = false;
  locked = false;
  finished = false;
  flippedCards = [];
  clearInterval(timerInterval);

  document.getElementById('level-select').hidden = true;
  document.getElementById('game-area').hidden = false;
  document.getElementById('results-section').hidden = true;

  document.getElementById('theme-name').textContent = set.title;
  document.getElementById('current-level').textContent = LEVEL_LABELS[level];
  document.getElementById('timer').textContent = '00:00';
  document.getElementById('move-count').textContent = '0';
  document.getElementById('pair-count').textContent = '0';

  const raw = [];
  set.pairs.forEach(p => {
    // Use encoded _p instead of plaintext pairId
    raw.push({ _p: p._p, text: p.a, side: 'a' });
    raw.push({ _p: p._p, text: p.b, side: 'b' });
  });

  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [raw[i], raw[j]] = [raw[j], raw[i]];
  }

  cards = raw.map((c, idx) => ({ ...c, idx, flipped: false, matched: false }));
  renderGrid(config.cols);
}

function renderGrid(cols) {
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  cards.forEach((card, i) => {
    const div = document.createElement('div');
    div.className = 'mem-card';
    div.dataset.idx = i;
    // Don't put card text in DOM until flipped — prevents inspect cheating
    div.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-card-front">?</div>
        <div class="mem-card-back"></div>
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
    // Decode pair IDs at comparison time
    const pairA = _d(cards[a]._p);
    const pairB = _d(cards[b]._p);
    if (pairA === pairB && cards[a].side !== cards[b].side) {
      cards[a].matched = true;
      cards[b].matched = true;
      matchedCount++;
      document.getElementById('pair-count').textContent = matchedCount;
      markMatched(a);
      markMatched(b);
      flippedCards = [];
      locked = false;
      if (matchedCount >= totalPairs) endGame();
    } else {
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
  if (show) {
    el.classList.add('flipped');
    // Set card text only when flipped — not present in DOM before
    const backEl = el.querySelector('.mem-card-back');
    if (backEl) backEl.textContent = cards[idx].text;
  } else {
    el.classList.remove('flipped');
    // Clear text when flipped back to prevent inspect
    const backEl = el.querySelector('.mem-card-back');
    if (backEl) backEl.textContent = '';
  }
}

function markMatched(idx) {
  document.querySelectorAll('.mem-card')[idx].classList.add('matched');
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSecs++;
    document.getElementById('timer').textContent = formatTime(timerSecs);
  }, 1000);
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

async function endGame() {
  if (finished) return;
  finished = true;
  clearInterval(timerInterval);

  const multiplier = LEVEL_MULTIPLIER[currentLevel];
  const rawScore = Math.max(0, Math.floor((matchedCount / totalPairs) * 1000 - timerSecs));
  const score = Math.floor(rawScore * multiplier);

  levelScores[currentLevel] = Math.max(levelScores[currentLevel] || 0, score);

  document.getElementById('res-pairs').textContent = `${matchedCount}/${totalPairs}`;
  document.getElementById('res-moves').textContent = moves;
  document.getElementById('res-time').textContent = formatTime(timerSecs);
  document.getElementById('res-score').textContent = score;
  document.getElementById('res-level').textContent = LEVEL_LABELS[currentLevel];
  document.getElementById('results-section').hidden = false;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  // Calculate total score across all levels
  const totalScore = Object.values(levelScores).reduce((a, b) => a + b, 0);

  // Cache progress locally
  const cacheKey = `memory_progress_${player.team_name}`;
  localStorage.setItem(cacheKey, JSON.stringify({ levelScores: { ...levelScores } }));

  await submitScore({
    usn: player.team_name, game: 'memory', score: totalScore,
    meta: { level: currentLevel, levelScore: score, pairs: matchedCount, moves, timeTaken: timerSecs, levelScores: { ...levelScores } },
  });
}

document.getElementById('back-to-levels')?.addEventListener('click', renderLevelSelect);
document.getElementById('play-again-btn')?.addEventListener('click', renderLevelSelect);

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
