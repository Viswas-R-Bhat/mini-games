import { initPlayer }   from '../lib/submitScore.js';
import { submitScore }  from '../lib/submitScore.js';
import { loadLeaderboard } from '../lib/leaderboard.js';

// ── Paragraph pool ────────────────────────────────────────────────────────────
const paragraphs = [
  "Artificial intelligence is rapidly transforming the way engineers and scientists solve complex real-world problems, from medical diagnosis to autonomous vehicles and climate modelling.",
  "BMS College of Engineering has consistently produced some of the brightest technical minds, hosting events that challenge students to think creatively and push the boundaries of innovation.",
  "Clean, readable code with well-structured logic is far more valuable than writing hundreds of lines quickly. Maintainability and clarity are the true marks of an experienced developer.",
  "Typing speed improves dramatically with deliberate practice and careful attention to accuracy. Building strong muscle memory allows your fingers to move fluently without looking at the keyboard.",
  "Machine learning models learn patterns from large datasets and apply those patterns to make predictions on new data, enabling applications like spam detection and product recommendations.",
  "Version control systems like Git allow teams of developers to collaborate on the same codebase simultaneously, track every change ever made, and roll back mistakes with a single command.",
  "The internet works by breaking data into small packets, routing each packet independently across a global network of routers, and reassembling them in the correct order at the destination.",
  "Cybersecurity professionals must constantly stay ahead of attackers by understanding vulnerabilities, patching systems regularly, and training users to recognise phishing and social engineering attacks.",
  "Competitive programming sharpens your ability to write efficient algorithms under time pressure, a skill that directly translates to performing well in technical interviews at top technology companies.",
  "Open source software powers a vast portion of the modern internet, from the Linux kernel running on servers to the frameworks developers use every day to build websites and mobile applications.",
];

// ── Constants ─────────────────────────────────────────────────────────────────
const GAME_DURATION = 30; // seconds

// ── State ─────────────────────────────────────────────────────────────────────
let player       = null;
let paragraph    = '';
let timerValue   = GAME_DURATION;
let timerHandle  = null;
let gameStarted  = false;
let gameOver     = false;

// ── DOM refs (populated after DOMContentLoaded) ───────────────────────────────
let paraDisplay, textarea, timerEl;
let statWpm, statAcc, statChars;
let resultsSection, resWpm, resAcc, resScore, resBest;
let lbSection, lbBody, lbLoading;
let startHint, viewLbBtn, playAgainBtn;

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  grabDOMRefs();
  player    = await initPlayer();
  paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];

  renderParagraph();
  resetUI();
  attachListeners();
});

// ── DOM helpers ───────────────────────────────────────────────────────────────
function grabDOMRefs() {
  paraDisplay  = document.getElementById('para-display');
  textarea     = document.getElementById('typing-area');
  timerEl      = document.getElementById('timer');
  statWpm      = document.getElementById('stat-wpm');
  statAcc      = document.getElementById('stat-acc');
  statChars    = document.getElementById('stat-chars');
  resultsSection = document.getElementById('results-section');
  resWpm       = document.getElementById('res-wpm');
  resAcc       = document.getElementById('res-acc');
  resScore     = document.getElementById('res-score');
  resBest      = document.getElementById('res-best');
  lbSection    = document.getElementById('lb-section');
  lbBody       = document.getElementById('lb-body');
  lbLoading    = document.getElementById('lb-loading');
  startHint    = document.getElementById('start-hint');
  viewLbBtn    = document.getElementById('view-lb-btn');
  playAgainBtn = document.getElementById('play-again-btn');
}

// Render paragraph as individual <span> elements (one per char)
function renderParagraph() {
  paraDisplay.innerHTML = '';
  [...paragraph].forEach((ch, i) => {
    const span = document.createElement('span');
    span.dataset.index = i;
    span.textContent   = ch;
    span.className     = 'char-untouched';
    paraDisplay.appendChild(span);
  });
}

function resetUI() {
  timerEl.textContent   = GAME_DURATION;
  timerEl.classList.remove('timer-urgent');
  textarea.value        = '';
  textarea.disabled     = false;
  startHint.hidden      = false;
  resultsSection.hidden = true;
  lbSection.hidden      = true;
  statWpm.textContent   = '0';
  statAcc.textContent   = '0';
  statChars.textContent = '0';

  gameStarted = false;
  gameOver    = false;
  timerValue  = GAME_DURATION;
}

// ── Event listeners ───────────────────────────────────────────────────────────
function attachListeners() {
  // Anti-cheat: block copy / paste / right-click
  textarea.addEventListener('copy',       (e) => e.preventDefault());
  textarea.addEventListener('cut',        (e) => e.preventDefault());
  textarea.addEventListener('contextmenu',(e) => e.preventDefault());
  textarea.addEventListener('paste',      handlePaste);
  textarea.addEventListener('input',      handleInput);
  textarea.addEventListener('keydown',    handleKeydown);

  viewLbBtn.addEventListener('click',  showLeaderboard);
  playAgainBtn.addEventListener('click', restartGame);
}

function handleKeydown(e) {
  if (gameOver) { e.preventDefault(); return; }
  if (!gameStarted) startGame();
}

function handlePaste(e) {
  e.preventDefault();
  endGame(true); // penalty: score = 0
}

function handleInput() {
  if (gameOver) return;
  if (!gameStarted) return; // shouldn't fire before keydown, but guard anyway
  updateDisplay();
  updateLiveStats();
}

// ── Game lifecycle ────────────────────────────────────────────────────────────
function startGame() {
  gameStarted = true;
  startHint.hidden = true;

  timerHandle = setInterval(() => {
    timerValue--;
    timerEl.textContent = timerValue;
    if (timerValue <= 10) timerEl.classList.add('timer-urgent');
    if (timerValue <= 0) endGame(false);
  }, 1000);
}

async function endGame(cheated = false) {
  if (gameOver) return;
  gameOver = true;

  clearInterval(timerHandle);
  timerHandle = null;
  textarea.disabled = true;

  const typed   = textarea.value;
  const metrics = computeMetrics(typed, cheated);

  showResults(metrics);

  await submitScore({
    usn:   player.usn,
    game:  'typing',
    score: metrics.score,
    meta:  {
      wpm:             metrics.wpm,
      accuracy:        metrics.accuracy,
      timeTaken:       GAME_DURATION,
      paragraphLength: paragraph.length,
    },
  });
}

function restartGame() {
  clearInterval(timerHandle);
  paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  renderParagraph();
  resetUI();
}

// ── Metrics ───────────────────────────────────────────────────────────────────
function computeMetrics(typed, cheated) {
  if (cheated || !typed.length) {
    return { wpm: 0, accuracy: 0, score: 0, correctChars: 0, totalTyped: 0 };
  }

  const totalTyped    = typed.length;
  const correctChars  = countCorrectChars(typed);
  const accuracy      = totalTyped > 0
    ? parseFloat(((correctChars / totalTyped) * 100).toFixed(1))
    : 0;
  const wpm           = parseFloat(((correctChars / 5) / (GAME_DURATION / 60)).toFixed(1));
  const score         = Math.floor(wpm * (accuracy / 100));

  return { wpm, accuracy, score, correctChars, totalTyped };
}

function countCorrectChars(typed) {
  let count = 0;
  for (let i = 0; i < Math.min(typed.length, paragraph.length); i++) {
    if (typed[i] === paragraph[i]) count++;
  }
  return count;
}

// ── Live display ──────────────────────────────────────────────────────────────
function updateDisplay() {
  const typed  = textarea.value;
  const spans  = paraDisplay.querySelectorAll('span');

  spans.forEach((span, i) => {
    if (i < typed.length) {
      span.className = typed[i] === paragraph[i] ? 'char-correct' : 'char-wrong';
    } else if (i === typed.length) {
      span.className = 'char-cursor';
    } else {
      span.className = 'char-untouched';
    }
  });
}

function updateLiveStats() {
  const typed        = textarea.value;
  const totalTyped   = typed.length;
  const correctChars = countCorrectChars(typed);
  const elapsed      = GAME_DURATION - timerValue || 1;
  const liveWpm      = totalTyped > 0
    ? Math.round((correctChars / 5) / (elapsed / 60))
    : 0;
  const liveAcc      = totalTyped > 0
    ? Math.round((correctChars / totalTyped) * 100)
    : 0;

  statWpm.textContent   = liveWpm;
  statAcc.textContent   = liveAcc;
  statChars.textContent = correctChars;
}

// ── Results ───────────────────────────────────────────────────────────────────
function showResults({ wpm, accuracy, score }) {
  resultsSection.hidden = false;
  resWpm.textContent    = wpm;
  resAcc.textContent    = accuracy + '%';
  resScore.textContent  = score;
  resBest.textContent   = '—';

  // Async: check personal best from leaderboard data
  loadLeaderboard('typing').then(rows => {
    const mine = rows.find(r => r.usn === player.usn);
    if (mine) resBest.textContent = mine.score;
  });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
async function showLeaderboard() {
  lbSection.hidden  = false;
  lbLoading.hidden  = false;
  lbBody.innerHTML  = '';
  viewLbBtn.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const rows = await loadLeaderboard('typing');
  lbLoading.hidden = true;

  if (!rows.length) {
    lbBody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#6b7fa3">No scores yet.</td></tr>';
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

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
