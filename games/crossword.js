// /games/crossword.js
// ENGINE ONLY — no puzzle content here. All puzzles live in /data/crosswords.js.
// UI shell lives in /pages/crossword.html.

import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard }         from '../lib/leaderboard.js';
import { crosswords }              from '../data/crosswords.js';

// ─── Validation (REQUIRED before any render) ──────────────────────────────────
function validateCrossword(cw) {
  const errors = [];
  const { gridSize, grid, across, down } = cw;

  if (!gridSize || !grid || !across || !down) {
    errors.push('Missing required top-level fields: gridSize | grid | across | down');
    return errors;
  }

  // 1. Grid dimensions
  if (grid.length !== gridSize.rows)
    errors.push(`Grid has ${grid.length} rows but gridSize.rows = ${gridSize.rows}`);

  grid.forEach((row, r) => {
    if (row.length !== gridSize.cols)
      errors.push(`Row ${r} has ${row.length} cols but gridSize.cols = ${gridSize.cols}`);
  });

  // 2. Letter consistency (across & down vs. grid)
  const checkWord = (list, dir) =>
    list.forEach(({ clue: num, row, col, answer }) => {
      if (!answer || typeof answer !== 'string') {
        errors.push(`${dir} ${num}: answer is missing or not a string`);
        return;
      }
      for (let i = 0; i < answer.length; i++) {
        const r = dir === 'across' ? row       : row + i;
        const c = dir === 'across' ? col + i   : col;
        const cell = grid[r]?.[c];
        if (!cell)
          errors.push(`${dir} ${num}: out of bounds at (${r}, ${c})`);
        else if (cell !== answer[i])
          errors.push(`${dir} ${num}: (${r}, ${c}) grid='${cell}' but answer='${answer[i]}'`);
      }
    });

  checkWord(across, 'across');
  checkWord(down,   'down');

  // 3. Orphan cells: every white cell must belong to at least one clue
  const covered = new Set();
  const cover = (list, dir) =>
    list.forEach(({ row, col, answer }) => {
      for (let i = 0; i < answer.length; i++) {
        const r = dir === 'across' ? row       : row + i;
        const c = dir === 'across' ? col + i   : col;
        covered.add(`${r},${c}`);
      }
    });
  cover(across, 'across');
  cover(down,   'down');

  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell && cell !== 0 && !covered.has(`${r},${c}`))
        errors.push(`Orphan white cell at (${r}, ${c}) — not covered by any clue`);
    })
  );

  return errors;
}

// ─── State ────────────────────────────────────────────────────────────────────
let puzzle;
let cellMap  = {};   // "r,c" → { el, inputEl, r, c }
let clueList = [];   // flat sorted list of all clues
let activeClue = null;   // { dir, index, ...clueData }

let timerSecs    = 0;
let timerRunning = false;
let timerInterval = null;
let finished = false;

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function init() {
  await initPlayer();

  // Pick a random puzzle
  puzzle = crosswords[Math.floor(Math.random() * crosswords.length)];

  const errors = validateCrossword(puzzle);
  if (errors.length) {
    const grid = document.getElementById('crossword-grid');
    grid.innerHTML = `
      <div style="color:var(--warn);font-family:var(--ff-mono);
                  padding:1rem;line-height:1.8;font-size:0.78rem">
        <strong>Invalid crossword dataset</strong><br>
        ${errors.map(e => `• ${e}`).join('<br>')}
      </div>`;
    console.error('[crossword] Validation errors:', errors);
    return;
  }

  buildClueList();
  renderGrid();
  renderClues();

  // Activate the first clue
  if (clueList.length) activateClue(clueList[0], false);
}

// ─── Clue list ────────────────────────────────────────────────────────────────
function buildClueList() {
  clueList = [
    ...puzzle.across.map((c, i) => ({ ...c, dir: 'across', index: i })),
    ...puzzle.down.map(  (c, i) => ({ ...c, dir: 'down',   index: i })),
  ];
  // Across before down, each sorted by clue number
  clueList.sort((a, b) => {
    if (a.dir !== b.dir) return a.dir === 'across' ? -1 : 1;
    return a.clue - b.clue;
  });
}

// ─── Grid render ─────────────────────────────────────────────────────────────
function renderGrid() {
  const { gridSize, grid, across, down } = puzzle;
  const container = document.getElementById('crossword-grid');
  container.style.gridTemplateColumns = `repeat(${gridSize.cols}, auto)`;
  container.innerHTML = '';
  cellMap = {};

  // Pre-compute clue-start numbers per cell
  const startNums = {};
  [...across, ...down].forEach(({ clue: num, row, col }) => {
    startNums[`${row},${col}`] = num;
  });

  for (let r = 0; r < gridSize.rows; r++) {
    for (let c = 0; c < gridSize.cols; c++) {
      const letter = grid[r][c];
      const div    = document.createElement('div');
      div.className = 'xw-cell';

      if (!letter) {
        div.classList.add('xw-black');
      } else {
        const num = startNums[`${r},${c}`];
        if (num != null) {
          const span = document.createElement('span');
          span.className   = 'xw-num';
          span.textContent = num;
          div.appendChild(span);
        }

        const input = document.createElement('input');
        input.className  = 'xw-input';
        input.maxLength  = 2;   // accept 2 so we can grab the new char on input event
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect',  'off');
        input.setAttribute('spellcheck',   'false');
        input.dataset.r  = r;
        input.dataset.c  = c;

        input.addEventListener('mousedown', e => { e.preventDefault(); onCellClick(r, c); });
        input.addEventListener('keydown',   e => onKeyDown(e, r, c));
        input.addEventListener('input',     e => onInput(e, r, c));

        div.appendChild(input);
        cellMap[`${r},${c}`] = { el: div, inputEl: input, r, c };
      }

      container.appendChild(div);
    }
  }
}

// ─── Clue panels ─────────────────────────────────────────────────────────────
function renderClues() {
  const acrossUl = document.getElementById('clues-across');
  const downUl   = document.getElementById('clues-down');

  const makeItem = (c) => {
    const li = document.createElement('li');
    li.className      = 'clue-item';
    li.dataset.dir    = c.dir;
    li.dataset.index  = c.index;
    li.innerHTML =
      `<span class="clue-num">${c.clue}</span>` +
      `<span class="clue-text">${c.text}</span>`;
    li.addEventListener('click', () => { activateClue(c, true); });
    return li;
  };

  puzzle.across.forEach((c, i) => acrossUl.appendChild(makeItem({ ...c, dir: 'across', index: i })));
  puzzle.down.forEach(  (c, i) => downUl.appendChild(  makeItem({ ...c, dir: 'down',   index: i })));
}

// ─── Activate a clue ─────────────────────────────────────────────────────────
function activateClue(c, focusFirst_ = true) {
  activeClue = { ...c };

  // Clear all highlights
  Object.values(cellMap).forEach(({ el }) =>
    el.classList.remove('xw-highlight', 'xw-active-cell'));

  // Highlight every cell in the word
  const { dir, row, col, answer } = c;
  for (let i = 0; i < answer.length; i++) {
    const r  = dir === 'across' ? row       : row + i;
    const cc = dir === 'across' ? col + i   : col;
    cellMap[`${r},${cc}`]?.el.classList.add('xw-highlight');
  }

  // Sync clue list highlight
  document.querySelectorAll('.clue-item').forEach(li => li.classList.remove('clue-active'));
  const li = document.querySelector(`.clue-item[data-dir="${c.dir}"][data-index="${c.index}"]`);
  if (li) { li.classList.add('clue-active'); li.scrollIntoView({ block: 'nearest' }); }

  // Move focus to first empty cell in word (or first cell if all filled)
  if (focusFirst_) {
    let targetKey = `${row},${col}`;
    for (let i = 0; i < answer.length; i++) {
      const r  = dir === 'across' ? row       : row + i;
      const cc = dir === 'across' ? col + i   : col;
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

// ─── Interaction ──────────────────────────────────────────────────────────────
function onCellClick(r, c) {
  const key = `${r},${c}`;
  if (!cellMap[key]) return;

  // Clicking the already-active cell toggles across ↔ down
  if (cellMap[key].el.classList.contains('xw-active-cell') && activeClue) {
    const otherDir = activeClue.dir === 'across' ? 'down' : 'across';
    const alt      = findClueForCell(r, c, otherDir);
    if (alt) { activateClue(alt, false); setActiveCell(r, c); cellMap[key].inputEl.focus(); return; }
  }

  // Otherwise find the best clue (prefer current direction)
  const preferred = activeClue ? findClueForCell(r, c, activeClue.dir) : null;
  const chosen    = preferred
    || findClueForCell(r, c, 'across')
    || findClueForCell(r, c, 'down');

  if (chosen) { activateClue(chosen, false); setActiveCell(r, c); cellMap[key].inputEl.focus(); }
}

function findClueForCell(r, c, dir) {
  const list = dir === 'across' ? puzzle.across : puzzle.down;
  for (let i = 0; i < list.length; i++) {
    const cl = list[i];
    for (let j = 0; j < cl.answer.length; j++) {
      const cr = dir === 'across' ? cl.row       : cl.row + j;
      const cc = dir === 'across' ? cl.col + j   : cl.col;
      if (cr === r && cc === c) return { ...cl, dir, index: i };
    }
  }
  return null;
}

function onKeyDown(e, r, c) {
  if (finished) return;

  if (e.key === 'Tab') {
    e.preventDefault();
    cycleClue(e.shiftKey ? -1 : 1);
    return;
  }

  if (e.key === 'Backspace') {
    e.preventDefault();
    const cur = cellMap[`${r},${c}`];
    if (cur?.inputEl.value) {
      cur.inputEl.value = '';
    } else {
      const prev = adjacentCell(r, c, -1);
      if (prev) { prev.inputEl.value = ''; prev.inputEl.focus(); setActiveCell(prev.r, prev.c); }
    }
    return;
  }

  const arrows = { ArrowRight:[0,1], ArrowLeft:[0,-1], ArrowUp:[-1,0], ArrowDown:[1,0] };
  if (arrows[e.key]) {
    e.preventDefault();
    const [dr, dc] = arrows[e.key];
    const next = cellMap[`${r+dr},${c+dc}`];
    if (next) { next.inputEl.focus(); setActiveCell(r+dr, c+dc); }
  }
}

function onInput(e, r, c) {
  if (finished) return;
  startTimer();

  const input = cellMap[`${r},${c}`]?.inputEl;
  if (!input) return;

  // Normalise: strip non-alpha, uppercase, keep only last char
  const raw = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  input.value = raw ? raw[raw.length - 1] : '';

  if (input.value) {
    const next = adjacentCell(r, c, +1);
    if (next) { next.inputEl.focus(); setActiveCell(next.r, next.c); }
  }
}

// Returns the cell before (-1) or after (+1) position (r,c) within activeClue
function adjacentCell(r, c, step) {
  if (!activeClue) return null;
  const { dir, row, col, answer } = activeClue;
  for (let i = 0; i < answer.length; i++) {
    const cr = dir === 'across' ? row       : row + i;
    const cc = dir === 'across' ? col + i   : col;
    if (cr === r && cc === c) {
      const ni = i + step;
      if (ni < 0 || ni >= answer.length) return null;
      const nr = dir === 'across' ? row       : row + ni;
      const nc = dir === 'across' ? col + ni  : col;
      return cellMap[`${nr},${nc}`] || null;
    }
  }
  return null;
}

function cycleClue(step) {
  if (!activeClue) return;
  const idx  = clueList.findIndex(c => c.dir === activeClue.dir && c.index === activeClue.index);
  const next = clueList[(idx + step + clueList.length) % clueList.length];
  activateClue(next, true);
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    timerSecs++;
    document.getElementById('timer').textContent = formatTime(timerSecs);
  }, 1000);
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Check / Score ────────────────────────────────────────────────────────────
document.getElementById('check-btn').addEventListener('click', checkAnswers);

async function checkAnswers() {
  if (finished) return;
  finished = true;
  clearInterval(timerInterval);

  let correct = 0;
  const total = Object.keys(cellMap).length;

  Object.values(cellMap).forEach(({ inputEl, r, c }) => {
    const expected = puzzle.grid[r][c];
    const given    = (inputEl.value || '').toUpperCase();
    if (given === expected) {
      correct++;
      inputEl.parentElement.classList.add('cell-correct');
    } else {
      inputEl.parentElement.classList.add('cell-wrong');
    }
    inputEl.disabled = true;
  });

  const rawScore  = Math.floor((correct / total) * 1000 - timerSecs);
  const finalScore = Math.max(0, rawScore);

  // Populate results UI
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-total').textContent   = total;
  document.getElementById('res-score').textContent   = finalScore;
  document.getElementById('res-time').textContent    = formatTime(timerSecs);
  document.getElementById('results-section').hidden  = false;
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });

  // Submit to leaderboard
  try {
    const player = JSON.parse(localStorage.getItem('mg_player') || '{}');
    await submitScore({
      usn:   player.usn,
      game:  'crossword',
      score: finalScore,
      meta:  { correct, total, timeTaken: timerSecs, puzzleId: puzzle.id },
    });
  } catch (err) {
    console.warn('[crossword] Score submission failed:', err);
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
document.getElementById('view-lb-btn').addEventListener('click', showLeaderboard);
document.getElementById('play-again-btn').addEventListener('click', () => location.reload());

async function showLeaderboard() {
  const section   = document.getElementById('lb-section');
  const loading   = document.getElementById('lb-loading');
  section.hidden  = false;
  loading.hidden  = false;
  section.scrollIntoView({ behavior: 'smooth' });

  try {
    const rows   = await loadLeaderboard('crossword');
    loading.hidden = true;

    const player = JSON.parse(localStorage.getItem('mg_player') || '{}');
    const tbody  = document.getElementById('lb-body');
    tbody.innerHTML = rows.map((row, i) => `
      <tr class="${row.usn === player.usn ? 'lb-mine' : ''}">
        <td class="lb-rank">${i + 1}</td>
        <td>${escHtml(row.username || '—')}</td>
        <td class="lb-usn">${escHtml(row.usn)}</td>
        <td class="lb-score">${row.score}</td>
      </tr>`).join('');

    if (!rows.length)
      tbody.innerHTML = `<tr><td colspan="4" style="padding:1rem;color:var(--muted);font-family:var(--ff-mono);font-size:0.75rem">No scores yet.</td></tr>`;
  } catch (err) {
    loading.textContent = 'Failed to load leaderboard.';
    console.error('[crossword] Leaderboard load failed:', err);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Go ───────────────────────────────────────────────────────────────────────
init();
