// /games/crossword.js — 3 puzzles, sequential unlock (Easy → Medium → Hard)
import { initPlayer, submitScore } from '../lib/submitScore.js';
import { crosswords } from '../data/crosswords.js';
import { _d } from '../lib/cipher.js';

let player = null;
let puzzle = null;
let puzzleIdx = 0;
let cellMap = {};
let clueList = [];
let activeClue = null;
let timerSecs = 0;
let timerRunning = false;
let timerInterval = null;
let finished = false;
let puzzleScores = {};

async function init() {
  player = await initPlayer();
  await loadProgress();
  renderPuzzleSelect();
}

async function loadProgress() {
  // Try localStorage first as instant fallback
  const cacheKey = `crossword_progress_${player.team_name}`;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    if (cached.puzzleScores) Object.assign(puzzleScores, cached.puzzleScores);
  } catch(e) {}

  // Then fetch from Supabase (source of truth)
  try {
    const { supabase } = await import('../lib/supabaseClient.js');
    const { data } = await supabase.from('attempt_logs').select('meta, score')
      .eq('team_name', player.team_name).eq('game', 'crossword')
      .order('created_at', { ascending: true });

    (data || []).forEach(r => {
      if (r.meta?.puzzleIdx !== undefined) {
        puzzleScores[r.meta.puzzleIdx] = Math.max(puzzleScores[r.meta.puzzleIdx] || 0, r.score);
      }
    });
    // Update cache
    localStorage.setItem(cacheKey, JSON.stringify({ puzzleScores: { ...puzzleScores } }));
  } catch(e) {
    console.warn('[crossword] Supabase load failed, using cached progress', e);
  }
}

function isPuzzleUnlocked(idx) {
  if (idx === 0) return true;
  return (puzzleScores[idx - 1] || 0) > 0;
}

function renderPuzzleSelect() {
  document.getElementById('puzzle-select').hidden = false;
  document.getElementById('crossword-area').hidden = true;
  document.getElementById('results-section').hidden = true;

  const container = document.getElementById('puzzle-buttons');
  container.innerHTML = '';

  crosswords.forEach((cw, i) => {
    const unlocked = isPuzzleUnlocked(i);
    const score = puzzleScores[i] || 0;
    const btn = document.createElement('button');
    btn.className = `puzzle-btn ${unlocked ? '' : 'locked'} ${score > 0 ? 'completed' : ''}`;
    btn.innerHTML = `
      <span class="puzzle-num">${i + 1}</span>
      <div class="puzzle-info">
        <span class="puzzle-title">${cw.title}</span>
        <span class="puzzle-diff diff-${cw.difficulty}">${cw.difficulty.toUpperCase()}</span>
      </div>
      <span class="puzzle-status">${score > 0 ? '✓ ' + score : unlocked ? 'PLAY →' : '🔒'}</span>
    `;
    if (unlocked) btn.addEventListener('click', () => startPuzzle(i));
    container.appendChild(btn);
  });
}

function startPuzzle(idx) {
  puzzleIdx = idx;
  puzzle = crosswords[idx];
  cellMap = {};
  clueList = [];
  activeClue = null;
  timerSecs = 0;
  timerRunning = false;
  finished = false;
  clearInterval(timerInterval);

  document.getElementById('puzzle-select').hidden = true;
  document.getElementById('crossword-area').hidden = false;
  document.getElementById('results-section').hidden = true;
  document.getElementById('timer').textContent = '00:00';
  document.getElementById('puzzle-name').textContent = puzzle.title;

  buildClueList();
  renderGrid();
  renderClues();
  if (clueList.length) activateClue(clueList[0], false);
}

function buildClueList() {
  clueList = [
    ...puzzle.across.map((c, i) => ({ ...c, dir: 'across', index: i })),
    ...puzzle.down.map((c, i) => ({ ...c, dir: 'down', index: i })),
  ].sort((a, b) => a.dir === b.dir ? a.clue - b.clue : a.dir === 'across' ? -1 : 1);
}

function renderGrid() {
  const { gridSize, grid, across, down } = puzzle;
  const container = document.getElementById('crossword-grid');
  container.style.gridTemplateColumns = `repeat(${gridSize.cols}, auto)`;
  container.innerHTML = '';
  cellMap = {};
  const startNums = {};
  [...across, ...down].forEach(({ clue: num, row, col }) => { startNums[`${row},${col}`] = num; });

  for (let r = 0; r < gridSize.rows; r++) {
    for (let c = 0; c < gridSize.cols; c++) {
      const cellVal = grid[r][c];
      const div = document.createElement('div');
      div.className = 'xw-cell';
      // 0 = black cell, any encoded string = letter cell
      if (!cellVal || cellVal === 0) { div.classList.add('xw-black'); }
      else {
        const num = startNums[`${r},${c}`];
        if (num != null) { const span = document.createElement('span'); span.className = 'xw-num'; span.textContent = num; div.appendChild(span); }
        const input = document.createElement('input');
        input.className = 'xw-input';
        input.maxLength = 2;
        input.setAttribute('autocomplete', 'off');
        input.dataset.r = r; input.dataset.c = c;
        input.addEventListener('mousedown', e => { e.preventDefault(); onCellClick(r, c); });
        input.addEventListener('keydown', e => onKeyDown(e, r, c));
        input.addEventListener('input', e => onInput(e, r, c));
        div.appendChild(input);
        cellMap[`${r},${c}`] = { el: div, inputEl: input, r, c };
      }
      container.appendChild(div);
    }
  }
}

function renderClues() {
  const acrossUl = document.getElementById('clues-across');
  const downUl = document.getElementById('clues-down');
  acrossUl.innerHTML = ''; downUl.innerHTML = '';
  const makeItem = (c) => {
    const li = document.createElement('li');
    li.className = 'clue-item';
    li.dataset.dir = c.dir; li.dataset.index = c.index;
    li.innerHTML = `<span class="clue-num">${c.clue}</span><span class="clue-text">${c.text}</span>`;
    li.addEventListener('click', () => activateClue(c, true));
    return li;
  };
  puzzle.across.forEach((c, i) => acrossUl.appendChild(makeItem({ ...c, dir: 'across', index: i })));
  puzzle.down.forEach((c, i) => downUl.appendChild(makeItem({ ...c, dir: 'down', index: i })));
}

function activateClue(c, focusFirst = true) {
  activeClue = { ...c };
  Object.values(cellMap).forEach(({ el }) => el.classList.remove('xw-highlight', 'xw-active-cell'));
  const { dir, row, col, len } = c;
  for (let i = 0; i < len; i++) {
    const r = dir === 'across' ? row : row + i;
    const cc = dir === 'across' ? col + i : col;
    cellMap[`${r},${cc}`]?.el.classList.add('xw-highlight');
  }
  document.querySelectorAll('.clue-item').forEach(li => li.classList.remove('clue-active'));
  const li = document.querySelector(`.clue-item[data-dir="${c.dir}"][data-index="${c.index}"]`);
  if (li) { li.classList.add('clue-active'); li.scrollIntoView({ block: 'nearest' }); }
  if (focusFirst) {
    let targetKey = `${row},${col}`;
    for (let i = 0; i < len; i++) {
      const r = dir === 'across' ? row : row + i;
      const cc = dir === 'across' ? col + i : col;
      const cell = cellMap[`${r},${cc}`];
      if (cell && !cell.inputEl.value) { targetKey = `${r},${cc}`; break; }
    }
    const cell = cellMap[targetKey];
    if (cell) { setActiveCell(cell.r, cell.c); cell.inputEl.focus(); }
  }
}

function setActiveCell(r, c) {
  Object.values(cellMap).forEach(({ el }) => el.classList.remove('xw-active-cell'));
  cellMap[`${r},${c}`]?.el.classList.add('xw-active-cell');
}

function onCellClick(r, c) {
  if (!cellMap[`${r},${c}`]) return;
  if (cellMap[`${r},${c}`].el.classList.contains('xw-active-cell') && activeClue) {
    const alt = findClueForCell(r, c, activeClue.dir === 'across' ? 'down' : 'across');
    if (alt) { activateClue(alt, false); setActiveCell(r, c); cellMap[`${r},${c}`].inputEl.focus(); return; }
  }
  const chosen = (activeClue ? findClueForCell(r, c, activeClue.dir) : null) || findClueForCell(r, c, 'across') || findClueForCell(r, c, 'down');
  if (chosen) { activateClue(chosen, false); setActiveCell(r, c); cellMap[`${r},${c}`].inputEl.focus(); }
}

function findClueForCell(r, c, dir) {
  const list = dir === 'across' ? puzzle.across : puzzle.down;
  for (let i = 0; i < list.length; i++) {
    const cl = list[i];
    for (let j = 0; j < cl.len; j++) {
      const cr = dir === 'across' ? cl.row : cl.row + j;
      const cc = dir === 'across' ? cl.col + j : cl.col;
      if (cr === r && cc === c) return { ...cl, dir, index: i };
    }
  }
  return null;
}

function onKeyDown(e, r, c) {
  if (finished) return;
  if (e.key === 'Tab') { e.preventDefault(); cycleClue(e.shiftKey ? -1 : 1); return; }
  if (e.key === 'Backspace') {
    e.preventDefault();
    const cur = cellMap[`${r},${c}`];
    if (cur?.inputEl.value) cur.inputEl.value = '';
    else { const prev = adjacentCell(r, c, -1); if (prev) { prev.inputEl.value = ''; prev.inputEl.focus(); setActiveCell(prev.r, prev.c); } }
    return;
  }
  const arrows = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
  if (arrows[e.key]) { e.preventDefault(); const [dr, dc] = arrows[e.key]; const next = cellMap[`${r + dr},${c + dc}`]; if (next) { next.inputEl.focus(); setActiveCell(r + dr, c + dc); } }
}

function onInput(e, r, c) {
  if (finished) return;
  startTimer();
  const input = cellMap[`${r},${c}`]?.inputEl;
  if (!input) return;
  const raw = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  input.value = raw ? raw[raw.length - 1] : '';
  if (input.value) { const next = adjacentCell(r, c, +1); if (next) { next.inputEl.focus(); setActiveCell(next.r, next.c); } }
}

function adjacentCell(r, c, step) {
  if (!activeClue) return null;
  const { dir, row, col, len } = activeClue;
  for (let i = 0; i < len; i++) {
    const cr = dir === 'across' ? row : row + i;
    const cc = dir === 'across' ? col + i : col;
    if (cr === r && cc === c) {
      const ni = i + step;
      if (ni < 0 || ni >= len) return null;
      const nr = dir === 'across' ? row : row + ni;
      const nc = dir === 'across' ? col + ni : col;
      return cellMap[`${nr},${nc}`] || null;
    }
  }
  return null;
}

function cycleClue(step) {
  if (!activeClue) return;
  const idx = clueList.findIndex(c => c.dir === activeClue.dir && c.index === activeClue.index);
  activateClue(clueList[(idx + step + clueList.length) % clueList.length], true);
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => { timerSecs++; document.getElementById('timer').textContent = formatTime(timerSecs); }, 1000);
}

function formatTime(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

document.getElementById('check-btn').addEventListener('click', checkAnswers);

async function checkAnswers() {
  if (finished) return;
  finished = true;
  clearInterval(timerInterval);

  // Build expected letter map by decoding clue answers at validation time
  const expectedMap = {};
  [...puzzle.across, ...puzzle.down].forEach(clue => {
    const answer = _d(clue._a);
    const dir = puzzle.across.includes(clue) ? 'across' : 'down';
    for (let i = 0; i < answer.length; i++) {
      const r = dir === 'across' ? clue.row : clue.row + i;
      const c = dir === 'across' ? clue.col + i : clue.col;
      expectedMap[`${r},${c}`] = answer[i];
    }
  });

  let correct = 0;
  const total = Object.keys(cellMap).length;
  Object.values(cellMap).forEach(({ inputEl, r, c }) => {
    const expected = expectedMap[`${r},${c}`];
    const given = (inputEl.value || '').toUpperCase();
    if (given === expected) { correct++; inputEl.parentElement.classList.add('cell-correct'); }
    else { inputEl.parentElement.classList.add('cell-wrong'); }
    inputEl.disabled = true;
  });

  const rawScore = Math.floor((correct / total) * 1000 - timerSecs);
  const finalScore = Math.max(0, rawScore);
  puzzleScores[puzzleIdx] = Math.max(puzzleScores[puzzleIdx] || 0, finalScore);

  const totalScore = Object.values(puzzleScores).reduce((a, b) => a + b, 0);

  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-total').textContent = total;
  document.getElementById('res-score').textContent = finalScore;
  document.getElementById('res-time').textContent = formatTime(timerSecs);
  document.getElementById('results-section').hidden = false;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  // Cache progress locally
  const cacheKey = `crossword_progress_${player.team_name}`;
  localStorage.setItem(cacheKey, JSON.stringify({ puzzleScores: { ...puzzleScores } }));

  await submitScore({
    usn: player.team_name, game: 'crossword', score: totalScore,
    meta: { correct, total, timeTaken: timerSecs, puzzleId: puzzle.id, puzzleIdx, puzzleScores: { ...puzzleScores } },
  });
}

document.getElementById('back-to-puzzles')?.addEventListener('click', renderPuzzleSelect);
document.getElementById('play-again-btn')?.addEventListener('click', renderPuzzleSelect);

function escHtml(str) { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

init();
