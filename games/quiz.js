// /games/quiz.js — ENGINE ONLY — 10 questions, 10s timer, hard CS quiz.
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard }         from '../lib/leaderboard.js';
import { questions as allQuestions } from '../data/quiz.js';

const NUM_QUESTIONS = 10;
const TIME_PER_Q    = 10; // seconds — hard mode

let player = null;
let questions = [];
let current = 0;
let correct = 0;
let totalTime = 0;
let qTimer = null;
let qTimeLeft = TIME_PER_Q;
let finished = false;
let answered = false;

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();

  // Shuffle and pick 10
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  questions = shuffled.slice(0, NUM_QUESTIONS);

  attachListeners();
  showQuestion();
});

function attachListeners() {
  document.getElementById('view-lb-btn').addEventListener('click', showLeaderboard);
  document.getElementById('play-again-btn').addEventListener('click', () => location.reload());
}

function showQuestion() {
  if (current >= questions.length) { endGame(); return; }

  answered = false;
  const q = questions[current];

  document.getElementById('q-progress').textContent = `${current + 1}/${NUM_QUESTIONS}`;
  document.getElementById('q-category').textContent = q.category;
  document.getElementById('q-text').textContent = q.question;
  document.getElementById('q-timer').textContent = TIME_PER_Q;
  document.getElementById('q-timer').classList.remove('timer-urgent');

  // Progress bar
  const pct = ((current) / NUM_QUESTIONS) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;

  // Render options
  const optionsEl = document.getElementById('q-options');
  optionsEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(i));
    optionsEl.appendChild(btn);
  });

  // Start per-question timer
  qTimeLeft = TIME_PER_Q;
  clearInterval(qTimer);
  qTimer = setInterval(() => {
    qTimeLeft--;
    totalTime++;
    document.getElementById('q-timer').textContent = qTimeLeft;
    if (qTimeLeft <= 3) document.getElementById('q-timer').classList.add('timer-urgent');
    if (qTimeLeft <= 0) {
      clearInterval(qTimer);
      selectAnswer(-1); // timeout = wrong
    }
  }, 1000);
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  clearInterval(qTimer);

  const q = questions[current];
  const buttons = document.querySelectorAll('.option-btn');

  // Highlight correct/wrong
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add('opt-correct');
    if (i === idx && idx !== q.answer) btn.classList.add('opt-wrong');
  });

  if (idx === q.answer) correct++;

  // Update score display
  document.getElementById('score-live').textContent = correct;

  // Next question after delay
  setTimeout(() => {
    current++;
    showQuestion();
  }, 1200);
}

async function endGame() {
  if (finished) return;
  finished = true;
  clearInterval(qTimer);

  const score = Math.max(0, Math.floor((correct / NUM_QUESTIONS) * 1000 - totalTime));

  // Final progress bar
  document.getElementById('progress-fill').style.width = '100%';

  // Hide question area, show results
  document.getElementById('quiz-area').hidden = true;
  document.getElementById('results-section').hidden = false;
  document.getElementById('res-correct').textContent = `${correct}/${NUM_QUESTIONS}`;
  document.getElementById('res-time').textContent = `${totalTime}s`;
  document.getElementById('res-score').textContent = score;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  await submitScore({
    usn: player.usn, game: 'quiz', score,
    meta: { correct, total: NUM_QUESTIONS, timeTaken: totalTime },
  });
}

async function showLeaderboard() {
  const section = document.getElementById('lb-section');
  const loading = document.getElementById('lb-loading');
  section.hidden = false;
  loading.hidden = false;
  section.scrollIntoView({ behavior: 'smooth' });

  const rows = await loadLeaderboard('quiz');
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
