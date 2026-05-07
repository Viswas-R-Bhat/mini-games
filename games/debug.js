// /games/debug.js — Find bugs in C, C++, Python. Mixed difficulty, weighted points.
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { snippets as allSnippets } from '../data/debug.js';

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
  attachListeners();
  renderSnippetList();
  startTimer();
});

function attachListeners() {
  document.getElementById('submit-fix').addEventListener('click', submitFix);
  document.getElementById('play-again-btn')?.addEventListener('click', () => location.reload());
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
      <div class="snippet-card-status" id="status-${i}">UNSOLVED</div>
    `;
    div.addEventListener('click', () => showRound(i));
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
  if (roundPhase !== 'select') return;
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
  const correctLine = snip.bugLine === selectedLine;
  const fixInput = document.getElementById('fix-input').value.trim();

  let roundScore = 0;
  let feedback = '';

  if (correctLine) {
    roundScore += Math.floor(snip.points * 0.5); // 50% for correct line
    feedback = '✓ Correct line identified! ';

    const normalize = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalize(fixInput) === normalize(snip.fixedCode)) {
      roundScore += Math.floor(snip.points * 0.5); // 50% for correct fix
      feedback += '✓ Perfect fix!';
    } else {
      feedback += '✗ Fix was incorrect.';
    }
  } else {
    feedback = `✗ Wrong line. Bug was on line ${snip.bugLine + 1}.`;
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
  document.getElementById('correct-fix').textContent = snip.fixedCode;
  document.getElementById('round-pts').textContent = `+${roundScore} pts (${snip.difficulty})`;

  document.querySelectorAll('.code-line').forEach((el, i) => {
    if (i === snip.bugLine) el.classList.add('line-bug');
    if (i === selectedLine && selectedLine !== snip.bugLine) el.classList.add('line-wrong-pick');
  });

  document.getElementById('fix-area').hidden = true;

  // Mark snippet as done
  snip._solved = true;

  // Check if all solved
  const allDone = snippets.every(s => s._solved);
  if (allDone) setTimeout(() => endGame(), 1500);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSecs++;
    totalTime++;
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

  const finalScore = Math.max(0, score - Math.floor(totalTime / 2));

  document.getElementById('debug-area').hidden = true;
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

// Add "Done / Submit" button handler
document.getElementById('finish-btn')?.addEventListener('click', () => endGame());

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
