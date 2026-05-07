// /games/debug.js — ENGINE ONLY — Find the bug, 5 rounds, multi-language.
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard }         from '../lib/leaderboard.js';
import { snippets as allSnippets } from '../data/debug.js';

const NUM_ROUNDS = 5;

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
let roundPhase = 'select'; // select | fix | result

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();
  const shuffled = [...allSnippets].sort(() => Math.random() - 0.5);
  snippets = shuffled.slice(0, NUM_ROUNDS);
  attachListeners();
  showRound();
});

function attachListeners() {
  document.getElementById('submit-fix').addEventListener('click', submitFix);
  document.getElementById('next-round').addEventListener('click', nextRound);
  document.getElementById('view-lb-btn').addEventListener('click', showLeaderboard);
  document.getElementById('play-again-btn').addEventListener('click', () => location.reload());
}

function showRound() {
  if (current >= snippets.length) { endGame(); return; }

  const snip = snippets[current];
  roundPhase = 'select';
  selectedLine = -1;

  document.getElementById('round-num').textContent = `${current + 1}/${NUM_ROUNDS}`;
  document.getElementById('snippet-title').textContent = snip.title;
  document.getElementById('snippet-lang').textContent = snip.language.toUpperCase();
  document.getElementById('fix-area').hidden = true;
  document.getElementById('round-result').hidden = true;
  document.getElementById('instruction-text').textContent = 'Click the line that contains the bug';

  // Render code
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

  startTimer();
}

function onLineClick(lineIdx) {
  if (roundPhase !== 'select') return;

  // Clear previous selection
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('line-selected'));

  selectedLine = lineIdx;
  document.querySelectorAll('.code-line')[lineIdx].classList.add('line-selected');

  // Show fix input
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

  // Score: 100 for correct line, 100 for correct fix (partial credit)
  let roundScore = 0;
  let feedback = '';

  if (correctLine) {
    roundScore += 100;
    feedback = '✓ Correct line identified! ';

    // Check fix — normalize whitespace for comparison
    const normalize = s => s.replace(/\s+/g, ' ').trim().toLowerCase();
    if (normalize(fixInput) === normalize(snip.fixedCode)) {
      roundScore += 100;
      feedback += '✓ Perfect fix!';
    } else {
      feedback += '✗ Fix was incorrect.';
    }
  } else {
    feedback = `✗ Wrong line. Bug was on line ${snip.bugLine + 1}.`;
  }

  score += roundScore;
  document.getElementById('score-live').textContent = score;

  // Show result
  const resultEl = document.getElementById('round-result');
  resultEl.hidden = false;
  document.getElementById('round-feedback').textContent = feedback;
  document.getElementById('round-hint').textContent = `Hint: ${snip.hint}`;
  document.getElementById('correct-fix').textContent = snip.fixedCode;

  // Highlight correct/wrong lines
  document.querySelectorAll('.code-line').forEach((el, i) => {
    if (i === snip.bugLine) el.classList.add('line-bug');
    if (i === selectedLine && selectedLine !== snip.bugLine) el.classList.add('line-wrong-pick');
  });

  document.getElementById('fix-area').hidden = true;
}

function nextRound() {
  current++;
  showRound();
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
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
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
    usn: player.usn, game: 'debug', score: finalScore,
    meta: { rawScore: score, timeTaken: totalTime, rounds: NUM_ROUNDS },
  });
}

async function showLeaderboard() {
  const section = document.getElementById('lb-section');
  const loading = document.getElementById('lb-loading');
  section.hidden = false;
  loading.hidden = false;
  section.scrollIntoView({ behavior: 'smooth' });

  const rows = await loadLeaderboard('debug');
  loading.hidden = true;
  const tbody = document.getElementById('lb-body');

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted)">No scores yet.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(row => `
    <tr class="${row.usn === player.usn ? 'lb-mine' : ''}">
      <td class="lb-rank">${row.rank}</td>
      <td>${escHtml(row.username)}</td>
      <td class="lb-usn">${escHtml(row.usn)}</td>
      <td class="lb-score">${row.score}</td>
    </tr>`).join('');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
