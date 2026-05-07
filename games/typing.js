import { initPlayer, submitScore, getAttemptInfo } from '../lib/submitScore.js';

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

const GAME_DURATION = 30;
const BASE_ATTEMPTS = 5;
const BEST_OF = 3;

let player = null;
let paragraph = '';
let timerValue = GAME_DURATION;
let timerHandle = null;
let gameStarted = false;
let gameOver = false;
let attemptScores = []; // scores from all attempts this session
let attemptInfo = null;

let paraDisplay, textarea, timerEl;
let statWpm, statAcc, statChars;
let resultsSection, resWpm, resAcc, resScore, resBest;
let startHint, playAgainBtn;
let attemptDisplay;

document.addEventListener('DOMContentLoaded', async () => {
  grabDOMRefs();
  player = await initPlayer();
  attemptInfo = await getAttemptInfo(player.team_name, 'typing', BASE_ATTEMPTS);

  // Load previous attempt scores from Supabase
  await loadPreviousAttempts();

  if (attemptInfo.remaining <= 0) {
    showNoAttemptsLeft();
    return;
  }

  paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  renderParagraph();
  resetUI();
  attachListeners();
  updateAttemptDisplay();
});

function grabDOMRefs() {
  paraDisplay = document.getElementById('para-display');
  textarea = document.getElementById('typing-area');
  timerEl = document.getElementById('timer');
  statWpm = document.getElementById('stat-wpm');
  statAcc = document.getElementById('stat-acc');
  statChars = document.getElementById('stat-chars');
  resultsSection = document.getElementById('results-section');
  resWpm = document.getElementById('res-wpm');
  resAcc = document.getElementById('res-acc');
  resScore = document.getElementById('res-score');
  resBest = document.getElementById('res-best');
  startHint = document.getElementById('start-hint');
  playAgainBtn = document.getElementById('play-again-btn');
  attemptDisplay = document.getElementById('attempt-display');
}

async function loadPreviousAttempts() {
  // Load from localStorage first (instant, reliable)
  const cacheKey = `typing_scores_${player.team_name}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    if (cached.length) attemptScores = cached;
  } catch {}

  // Then try Supabase — only update if it has MORE data
  try {
    const { data } = await (await import('../lib/supabaseClient.js')).supabase
      .from('attempt_logs')
      .select('score')
      .eq('team_name', player.team_name)
      .eq('game', 'typing')
      .order('created_at', { ascending: true });

    const supaScores = (data || []).map(r => r.score);
    if (supaScores.length >= attemptScores.length) {
      attemptScores = supaScores;
    }
    // Update cache with best known data
    localStorage.setItem(cacheKey, JSON.stringify(attemptScores));
  } catch (e) {
    console.warn('[typing] Supabase load failed, using cached scores');
  }
}

function updateAttemptDisplay() {
  if (!attemptDisplay) return;
  const used = attemptInfo.used + (attemptScores.length - attemptInfo.used);
  attemptDisplay.textContent = `Attempt ${Math.min(used + 1, attemptInfo.allowed)} / ${attemptInfo.allowed}`;
}

function showNoAttemptsLeft() {
  if (paraDisplay) paraDisplay.innerHTML = '';
  if (textarea) { textarea.disabled = true; textarea.placeholder = 'No attempts remaining.'; }
  if (startHint) startHint.hidden = true;

  const best3 = getBest3Score();
  resultsSection.hidden = false;
  resWpm.textContent = '—';
  resAcc.textContent = '—';
  resScore.textContent = best3;
  resBest.textContent = `Best 3 of ${attemptScores.length}`;
  if (playAgainBtn) playAgainBtn.style.display = 'none';

  document.getElementById('res-title-text').textContent = 'ALL ATTEMPTS USED';
}

function getBest3Score() {
  if (attemptScores.length === 0) return 0;
  const sorted = [...attemptScores].sort((a, b) => b - a);
  const best = sorted.slice(0, BEST_OF);
  return Math.round(best.reduce((a, b) => a + b, 0) / best.length);
}

function renderParagraph() {
  paraDisplay.innerHTML = '';
  [...paragraph].forEach((ch, i) => {
    const span = document.createElement('span');
    span.dataset.index = i;
    span.textContent = ch;
    span.className = 'char-untouched';
    paraDisplay.appendChild(span);
  });
}

function resetUI() {
  timerEl.textContent = GAME_DURATION;
  timerEl.classList.remove('timer-urgent');
  textarea.value = '';
  textarea.disabled = false;
  startHint.hidden = false;
  resultsSection.hidden = true;
  statWpm.textContent = '0';
  statAcc.textContent = '0';
  statChars.textContent = '0';
  gameStarted = false;
  gameOver = false;
  timerValue = GAME_DURATION;
}

function attachListeners() {
  textarea.addEventListener('copy', e => e.preventDefault());
  textarea.addEventListener('cut', e => e.preventDefault());
  textarea.addEventListener('contextmenu', e => e.preventDefault());
  textarea.addEventListener('paste', handlePaste);
  textarea.addEventListener('input', handleInput);
  textarea.addEventListener('keydown', handleKeydown);
  playAgainBtn.addEventListener('click', restartGame);
}

function handleKeydown(e) {
  if (gameOver) { e.preventDefault(); return; }
  if (!gameStarted) startGame();
}

function handlePaste(e) {
  e.preventDefault();
  endGame(true);
}

function handleInput() {
  if (gameOver || !gameStarted) return;
  updateDisplay();
  updateLiveStats();
}

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
  textarea.disabled = true;

  const typed = textarea.value;
  const metrics = computeMetrics(typed, cheated);

  attemptScores.push(metrics.score);
  // Cache to localStorage immediately
  localStorage.setItem(`typing_scores_${player.team_name}`, JSON.stringify(attemptScores));
  const best3 = getBest3Score();

  showResults(metrics, best3);

  await submitScore({
    usn: player.team_name,
    game: 'typing',
    score: best3,
    meta: {
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      timeTaken: GAME_DURATION,
      attemptScore: metrics.score,
      attemptScores: [...attemptScores],
    },
  });

  // Refresh attempt info
  attemptInfo = await getAttemptInfo(player.team_name, 'typing', BASE_ATTEMPTS);
  updateAttemptDisplay();

  if (attemptInfo.remaining <= 0 && playAgainBtn) {
    playAgainBtn.style.display = 'none';
  }
}

async function restartGame() {
  attemptInfo = await getAttemptInfo(player.team_name, 'typing', BASE_ATTEMPTS);
  if (attemptInfo.remaining <= 0) {
    showNoAttemptsLeft();
    return;
  }
  clearInterval(timerHandle);
  paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
  renderParagraph();
  resetUI();
  updateAttemptDisplay();
}

function computeMetrics(typed, cheated) {
  if (cheated || !typed.length) return { wpm: 0, accuracy: 0, score: 0, correctChars: 0, totalTyped: 0 };
  const totalTyped = typed.length;
  const correctChars = countCorrectChars(typed);
  const accuracy = parseFloat(((correctChars / totalTyped) * 100).toFixed(1));
  const wpm = parseFloat(((correctChars / 5) / (GAME_DURATION / 60)).toFixed(1));
  const score = Math.floor(wpm * (accuracy / 100));
  return { wpm, accuracy, score, correctChars, totalTyped };
}

function countCorrectChars(typed) {
  let count = 0;
  for (let i = 0; i < Math.min(typed.length, paragraph.length); i++) {
    if (typed[i] === paragraph[i]) count++;
  }
  return count;
}

function updateDisplay() {
  const typed = textarea.value;
  const spans = paraDisplay.querySelectorAll('span');
  spans.forEach((span, i) => {
    if (i < typed.length) span.className = typed[i] === paragraph[i] ? 'char-correct' : 'char-wrong';
    else if (i === typed.length) span.className = 'char-cursor';
    else span.className = 'char-untouched';
  });
}

function updateLiveStats() {
  const typed = textarea.value;
  const totalTyped = typed.length;
  const correctChars = countCorrectChars(typed);
  const elapsed = GAME_DURATION - timerValue || 1;
  statWpm.textContent = totalTyped > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
  statAcc.textContent = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  statChars.textContent = correctChars;
}

function showResults({ wpm, accuracy, score }, best3) {
  resultsSection.hidden = false;
  resWpm.textContent = wpm;
  resAcc.textContent = accuracy + '%';
  resScore.textContent = score;
  resBest.textContent = best3 + ' (best 3 avg)';
  document.getElementById('res-title-text').textContent = 'GAME OVER';
}
