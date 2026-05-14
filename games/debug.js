// /games/debug.js — Find bugs in C, C++, Python. Mixed difficulty, weighted points.
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { snippets as allSnippets } from '../data/debug.js';
import { _n, _d } from '../lib/cipher.js';

let player = null;
let snippets = [];
let current = 0;
let score = 0;
let totalTime = 0;
let timerSecs = 0;
let timerInterval = null;
let timerRunning = false;
let selectedLine = -1;
let finished = false;
let roundPhase = 'select';

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();

  // Show ALL snippets — player can solve any, order by difficulty
  snippets = [...allSnippets].sort((a, b) => {
    const order = { easy: 0, medium: 1, hard: 2 };
    return order[a.difficulty] - order[b.difficulty];
  });

  // ── Check if game was already completed ─────────────────────────────
  const completedKey = `debug_completed_v2_${player.team_name}`;
  const completedData = JSON.parse(localStorage.getItem(completedKey) || 'null');
  if (completedData) {
    // Game was already finished — show locked results, block replay
    finished = true;
    document.getElementById('debug-area').hidden = true;
    document.getElementById('snippet-list').hidden = true;
    document.getElementById('results-section').hidden = false;
    document.getElementById('res-points').textContent = completedData.rawScore;
    document.getElementById('res-time').textContent = formatTime(completedData.timeTaken);
    document.getElementById('res-score').textContent = completedData.finalScore;
    document.getElementById('total-available').textContent = snippets.reduce((s, q) => s + q.points, 0);
    return; // Don't start timer or allow any interaction
  }

  // ── Restore saved session if it exists ──────────────────────────────
  const sessionKey = `debug_session_${player.team_name}`;
  const saved = JSON.parse(localStorage.getItem(sessionKey) || 'null');
  if (saved) {
    timerSecs = saved.timerSecs || 0;
    totalTime = saved.totalTime || 0;
    score = saved.score || 0;
    const scoreLiveEl = document.getElementById('score-live');
    if (scoreLiveEl) scoreLiveEl.textContent = score;
    // Re-mark solved snippets so cards show correct status after restore
    (saved.solvedIds || []).forEach(title => {
      const snip = snippets.find(s => s.title === title);
      if (snip) snip._solved = true;
    });
  }

  attachListeners();
  renderSnippetList();
  startTimer();
});

function attachListeners() {
  document.getElementById('submit-fix').addEventListener('click', submitFix);
  // Navigate back to games list instead of reloading (which would reset the game)
  document.getElementById('play-again-btn')?.addEventListener('click', () => {
    window.location.href = '../games_list.html';
  });
}

function renderSnippetList() {
  const listEl = document.getElementById('snippet-list');
  if (!listEl) { showRound(0); return; }

  listEl.innerHTML = '';
  snippets.forEach((snip, i) => {
    const div = document.createElement('div');
    div.className = `snippet-card difficulty-${snip.difficulty}`;
    div.dataset.idx = i;
    div.innerHTML = `
      <div class="snippet-card-header">
        <span class="snippet-difficulty diff-${snip.difficulty}">${snip.difficulty.toUpperCase()}</span>
        <span class="snippet-lang">${snip.language.toUpperCase()}</span>
        <span class="snippet-pts">${snip.points} pts</span>
      </div>
      <div class="snippet-card-title">${snip.title}</div>
      <div class="snippet-card-status" id="status-${i}">${snip._solved ? 'SOLVED' : 'UNSOLVED'}</div>
    `;
    // Grey out already-solved cards
    if (snip._solved) div.classList.add('solved');
    div.addEventListener('click', () => { if (!snip._solved) showRound(i); });
    listEl.appendChild(div);
  });

  document.getElementById('total-available').textContent =
    snippets.reduce((s, q) => s + q.points, 0);
}

function showRound(idx) {
  current = idx;
  const snip = snippets[current];
  roundPhase = 'select';
  selectedLine = -1;

  document.getElementById('snippet-title').textContent = snip.title;
  document.getElementById('snippet-lang').textContent = snip.language.toUpperCase();
  document.getElementById('snippet-difficulty').textContent = snip.difficulty.toUpperCase();
  document.getElementById('snippet-difficulty').className = `diff-badge diff-${snip.difficulty}`;
  document.getElementById('snippet-points').textContent = `${snip.points} pts`;
  document.getElementById('fix-area').hidden = true;
  document.getElementById('round-result').hidden = true;
  document.getElementById('instruction-text').textContent = 'Click the line that contains the bug';

  const codeEl = document.getElementById('code-display');
  codeEl.innerHTML = '';
  snip.code.forEach((line, i) => {
    const div = document.createElement('div');
    div.className = 'code-line';
    div.dataset.line = i;
    div.innerHTML = `<span class="line-num">${i + 1}</span><span class="line-code">${escHtml(line)}</span>`;
    div.addEventListener('click', () => onLineClick(i));
    codeEl.appendChild(div);
  });

  // Show debug area
  document.getElementById('debug-area').hidden = false;
  document.getElementById('results-section').hidden = true;
}

function onLineClick(lineIdx) {
  if (roundPhase !== 'select' && roundPhase !== 'fix') return;
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('line-selected'));
  selectedLine = lineIdx;
  document.querySelectorAll('.code-line')[lineIdx].classList.add('line-selected');

  roundPhase = 'fix';
  document.getElementById('fix-area').hidden = false;
  document.getElementById('fix-input').value = '';
  document.getElementById('fix-input').placeholder = `Fix line ${lineIdx + 1}...`;
  document.getElementById('fix-input').focus();
  document.getElementById('instruction-text').textContent = 'Now type the corrected line below';
}

function submitFix() {
  if (roundPhase !== 'fix') return;
  roundPhase = 'result';

  const snip = snippets[current];
  // Decode answer only at validation time
  const bugLine = _n(snip._bl);
  const fixedCode = _d(snip._fc);
  const correctLine = bugLine === selectedLine;
  const fixInput = document.getElementById('fix-input').value.trim();

  let roundScore = 0;
  let feedback = '';

  if (correctLine) {
    roundScore += Math.floor(snip.points * 0.5); // 50% for correct line
    feedback = '✓ Correct line identified! ';

    const normalize = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalize(fixInput) === normalize(fixedCode)) {
      roundScore += Math.floor(snip.points * 0.5); // 50% for correct fix
      feedback += '✓ Perfect fix!';
    } else {
      feedback += '✗ Fix was incorrect.';
    }
  } else {
    feedback = `✗ Wrong line. Bug was on line ${bugLine + 1}.`;
  }

  score += roundScore;
  document.getElementById('score-live').textContent = score;

  // Update snippet card status
  const statusEl = document.getElementById(`status-${current}`);
  if (statusEl) {
    statusEl.textContent = roundScore > 0 ? `+${roundScore}` : 'WRONG';
    statusEl.className = `snippet-card-status ${roundScore > 0 ? 'solved' : 'failed'}`;
  }

  const resultEl = document.getElementById('round-result');
  resultEl.hidden = false;
  document.getElementById('round-feedback').textContent = feedback;
  document.getElementById('round-hint').textContent = `Hint: ${snip.hint}`;
  document.getElementById('correct-fix').textContent = fixedCode;
  document.getElementById('round-pts').textContent = `+${roundScore} pts (${snip.difficulty})`;

  document.querySelectorAll('.code-line').forEach((el, i) => {
    if (i === bugLine) el.classList.add('line-bug');
    if (i === selectedLine && selectedLine !== bugLine) el.classList.add('line-wrong-pick');
  });

  document.getElementById('fix-area').hidden = true;

  // Mark snippet as done
  snip._solved = true;

  // Persist progress immediately after each submission
  saveSession();

  // Check if all solved
  const allDone = snippets.every(s => s._solved);
  if (allDone) setTimeout(() => endGame(), 1500);
}

// ── Timer ────────────────────────────────────────────────────────────────────
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;

  // Render restored time immediately so the display isn't wrong for the first tick
  const timerEl = document.getElementById('timer');
  if (timerEl) timerEl.textContent = formatTime(timerSecs);

  timerInterval = setInterval(() => {
    timerSecs++;
    totalTime++;
    if (timerEl) timerEl.textContent = formatTime(timerSecs);

    // Persist every 5 seconds — refresh costs at most 5s of timer drift
    if (timerSecs % 5 === 0) saveSession();
  }, 1000);
}

function saveSession() {
  if (!player) return;
  const sessionKey = `debug_session_${player.team_name}`;
  localStorage.setItem(sessionKey, JSON.stringify({
    timerSecs,
    totalTime,
    score,
    solvedIds: snippets.filter(s => s._solved).map(s => s.title),
  }));
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ── End game ─────────────────────────────────────────────────────────────────
async function endGame() {
  if (finished) return;
  finished = true;
  clearInterval(timerInterval);

  const finalScore = Math.max(0, score - Math.floor(totalTime / 2));

  // Save completion record — prevents replay on refresh
  if (player) {
    const completedKey = `debug_completed_v2_${player.team_name}`;
    localStorage.setItem(completedKey, JSON.stringify({
      rawScore: score,
      timeTaken: totalTime,
      finalScore,
    }));
    // Clear the in-progress session
    localStorage.removeItem(`debug_session_${player.team_name}`);
  }

  document.getElementById('debug-area').hidden = true;
  document.getElementById('snippet-list').hidden = true;
  document.getElementById('results-section').hidden = false;
  document.getElementById('res-points').textContent = score;
  document.getElementById('res-time').textContent = formatTime(totalTime);
  document.getElementById('res-score').textContent = finalScore;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  await submitScore({
    usn: player.team_name, game: 'debug', score: finalScore,
    meta: { rawScore: score, timeTaken: totalTime, totalSnippets: snippets.length },
  });
}

// "Done / Submit all" button
document.getElementById('finish-btn')?.addEventListener('click', () => endGame());

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}