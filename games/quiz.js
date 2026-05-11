import { initPlayer, submitScore, getAttemptInfo } from '../lib/submitScore.js';
import { questionsByRound } from '../data/quiz.js';
import { _n } from '../lib/cipher.js';

const NUM_QUESTIONS = 10;
const TIME_PER_Q = 10;
const BASE_ATTEMPTS = 3;

const ROUND_LABELS = { 1: 'General Knowledge', 2: 'Basic CS', 3: 'Hard CS' };

let player = null;
let questions = [];
let current = 0;
let correct = 0;
let totalTime = 0;
let qTimer = null;
let qTimeLeft = TIME_PER_Q;
let finished = false;
let answered = false;
let attemptScores = [];
let attemptInfo = null;
let currentRound = 1;

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();
  attemptInfo = await getAttemptInfo(player.team_name, 'quiz', BASE_ATTEMPTS);
  await loadPreviousAttempts();

  // Determine which round based on attempts used
  currentRound = Math.min(attemptScores.length + 1, 3);

  if (attemptInfo.remaining <= 0) {
    showNoAttemptsLeft();
    return;
  }

  // Pick questions from the current round
  const roundQuestions = questionsByRound[currentRound] || questionsByRound[3];
  const shuffled = [...roundQuestions].sort(() => Math.random() - 0.5);
  questions = shuffled.slice(0, NUM_QUESTIONS);
  attachListeners();
  showQuestion();
  updateAttemptDisplay();
  updateRoundDisplay();
});

async function loadPreviousAttempts() {
  // Load from localStorage first (instant, reliable)
  const cacheKey = `quiz_scores_${player.team_name}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    if (cached.length) attemptScores = cached;
  } catch {}

  // Then try Supabase — only update if it has MORE data
  try {
    const { supabase } = await import('../lib/supabaseClient.js');
    const { data } = await supabase.from('attempt_logs').select('score')
      .eq('team_name', player.team_name).eq('game', 'quiz')
      .order('created_at', { ascending: true });

    const supaScores = (data || []).map(r => r.score);
    if (supaScores.length >= attemptScores.length) {
      attemptScores = supaScores;
    }
    localStorage.setItem(cacheKey, JSON.stringify(attemptScores));
  } catch (e) {
    console.warn('[quiz] Supabase load failed, using cached scores');
  }
}

function updateAttemptDisplay() {
  const el = document.getElementById('attempt-display');
  if (el) el.textContent = `${Math.min(attemptScores.length + 1, attemptInfo.allowed)} / ${attemptInfo.allowed}`;
}

function updateRoundDisplay() {
  const el = document.getElementById('q-category');
  if (el) el.textContent = `Round ${currentRound}: ${ROUND_LABELS[currentRound]}`;
}

function showNoAttemptsLeft() {
  const best = attemptScores.length ? Math.max(...attemptScores) : 0;
  document.getElementById('quiz-area').hidden = true;
  document.getElementById('results-section').hidden = false;
  document.getElementById('res-correct').textContent = '—';
  document.getElementById('res-time').textContent = '—';
  document.getElementById('res-score').textContent = best + ' (best)';
  document.getElementById('res-title-text').textContent = 'ALL ATTEMPTS USED';
  const btn = document.getElementById('play-again-btn');
  if (btn) btn.style.display = 'none';
}

function attachListeners() {
  document.getElementById('play-again-btn').addEventListener('click', async () => {
    attemptInfo = await getAttemptInfo(player.team_name, 'quiz', BASE_ATTEMPTS);
    if (attemptInfo.remaining <= 0) { showNoAttemptsLeft(); return; }
    location.reload();
  });
}

function showQuestion() {
  if (current >= questions.length) { endGame(); return; }
  answered = false;
  const q = questions[current];

  document.getElementById('q-progress').textContent = `${current + 1}/${NUM_QUESTIONS}`;
  document.getElementById('q-text').textContent = q.question;
  document.getElementById('q-timer').textContent = TIME_PER_Q;
  document.getElementById('q-timer').classList.remove('timer-urgent');
  document.getElementById('progress-fill').style.width = `${(current / NUM_QUESTIONS) * 100}%`;

  const optionsEl = document.getElementById('q-options');
  optionsEl.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => selectAnswer(i));
    optionsEl.appendChild(btn);
  });

  qTimeLeft = TIME_PER_Q;
  clearInterval(qTimer);
  qTimer = setInterval(() => {
    qTimeLeft--;
    totalTime++;
    document.getElementById('q-timer').textContent = qTimeLeft;
    if (qTimeLeft <= 3) document.getElementById('q-timer').classList.add('timer-urgent');
    if (qTimeLeft <= 0) { clearInterval(qTimer); selectAnswer(-1); }
  }, 1000);
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;
  clearInterval(qTimer);

  const q = questions[current];
  // Decode answer only at validation time
  const correctIdx = _n(q._a);
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('opt-correct');
    if (i === idx && idx !== correctIdx) btn.classList.add('opt-wrong');
  });

  if (idx === correctIdx) correct++;
  document.getElementById('score-live').textContent = correct;

  setTimeout(() => { current++; showQuestion(); }, 1200);
}

async function endGame() {
  if (finished) return;
  finished = true;
  clearInterval(qTimer);

  const score = Math.max(0, Math.floor((correct / NUM_QUESTIONS) * 1000 - totalTime));
  attemptScores.push(score);
  // Cache to localStorage immediately
  localStorage.setItem(`quiz_scores_${player.team_name}`, JSON.stringify(attemptScores));
  const best = Math.max(...attemptScores);

  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('quiz-area').hidden = true;
  document.getElementById('results-section').hidden = false;
  document.getElementById('res-correct').textContent = `${correct}/${NUM_QUESTIONS}`;
  document.getElementById('res-time').textContent = `${totalTime}s`;
  document.getElementById('res-score').textContent = score;
  document.getElementById('res-title-text').textContent = `ROUND ${currentRound} COMPLETE`;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  await submitScore({
    usn: player.team_name, game: 'quiz', score: best,
    meta: { correct, total: NUM_QUESTIONS, timeTaken: totalTime, round: currentRound, attemptScores: [...attemptScores] },
  });

  // Save progress to localStorage as backup
  localStorage.setItem(`quiz_progress_${player.team_name}`, JSON.stringify({ attemptScores, round: currentRound }));

  attemptInfo = await getAttemptInfo(player.team_name, 'quiz', BASE_ATTEMPTS);
  updateAttemptDisplay();

  const btn = document.getElementById('play-again-btn');
  if (attemptInfo.remaining <= 0) {
    if (btn) btn.style.display = 'none';
  } else {
    const nextRound = Math.min(currentRound + 1, 3);
    if (btn) btn.textContent = `NEXT: ROUND ${nextRound} — ${ROUND_LABELS[nextRound]} →`;
  }
}
