import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard }         from '../lib/leaderboard.js';
import { crosswords }              from '../data/crosswords.js';

// ── State ─────────────────────────────────────────────────────────────────────
let player         = null;
let puzzle         = null;
let solutionMap    = {};
let cellMap        = {};
let activeClue     = null;
let activeDir      = 'across';
let timerValue     = 0;
let timerHandle    = null;
let gameStarted    = false;
let gameOver       = false;

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();
  puzzle = crosswords[Math.floor(Math.random() * crosswords.length)];

  const validation = validateCrossword(puzzle);
  if (!validation.valid) {
    showValidationError(puzzle.id ?? 'unknown', validation.errors);
    return;
  }

  mountGame();
});

function mountGame() {
  buildMaps();
  renderGrid();
  renderClues();
  updateTimerDisplay();
  document.getElementById('check-btn').addEventListener('click', checkAnswers);
  document.getElementById('play-again-btn').addEventListener('click', restartGame);
  document.getElementById('view-lb-btn').addEventListener('click', showLeaderboard);
}

// =============================================================================
// VALIDATION SYSTEM
// =============================================================================

/**
 * validateCrossword(crossword)
 *
 * Runs 6 checks:
 *   1. Grid shape       — dimensions match gridSize
 *   2. Clue starts      — across: left is boundary; down: top is boundary
 *   3. Across path      — uninterrupted run right == answer.length
 *   4. Down path        — uninterrupted run down  == answer.length
 *   5. Intersections    — same cell used by two clues must agree on letter
 *   6. Orphan cells     — every non-# cell must belong to at least one clue
 *
 * Returns { valid: boolean, errors: string[] }
 */
export function validateCrossword(cw) {
  const errors = [];

  if (!cw || typeof cw !== 'object') {
    errors.push('Crossword object is missing or malformed');
    return { valid: false, errors };
  }

  const { gridSize, grid, clues } = cw;

  if (!grid || !clues) {
    errors.push('Missing required fields: grid and/or clues');
    return { valid: false, errors };
  }

  const across = clues.across ?? [];
  const down   = clues.down   ?? [];

  // Helpers
  const cellVal  = (r, c) => grid[r]?.[c];
  const isBlackV = (r, c) => cellVal(r, c) === '#' || cellVal(r, c) === undefined;

  // ── Rule 1: Grid shape ───────────────────────────────────────────────────────
  if (!Number.isInteger(gridSize) || gridSize < 2) {
    errors.push(`gridSize must be an integer >= 2, got ${gridSize}`);
  }

  if (!Array.isArray(grid)) {
    errors.push('grid must be an array');
    return { valid: false, errors };           // can't continue without a grid
  }

  if (grid.length !== gridSize) {
    errors.push(
      `Grid has ${grid.length} rows but gridSize is ${gridSize}`
    );
  }

  for (let r = 0; r < grid.length; r++) {
    if (!Array.isArray(grid[r])) {
      errors.push(`Row ${r} is not an array`);
    } else if (grid[r].length !== gridSize) {
      errors.push(
        `Row ${r} has ${grid[r].length} cells but gridSize is ${gridSize}`
      );
    }
  }

  // ── Rule 2 + 3: Across clues ─────────────────────────────────────────────────
  for (const clue of across) {
    const { number, row, col, answer } = clue;
    const tag = `Across ${number} "${answer}"`;

    if (isBlackV(row, col)) {
      errors.push(`${tag}: starting cell (${row},${col}) is black or out of bounds`);
      continue;
    }

    // Rule 2: left cell must be boundary
    if (!isBlackV(row, col - 1)) {
      errors.push(
        `${tag}: starts at (${row},${col}) but (${row},${col - 1}) is not a boundary — clue starts mid-word`
      );
    }

    // Rule 3: measure the uninterrupted run to the right
    let run = 0;
    for (let c = col; c < gridSize; c++) {
      if (isBlackV(row, c)) break;
      run++;
    }

    if (run !== answer.length) {
      errors.push(
        `${tag}: answer has ${answer.length} letters but cell run at (${row},${col}) is ${run} cells`
      );
    }
  }

  // ── Rule 2 + 4: Down clues ───────────────────────────────────────────────────
  for (const clue of down) {
    const { number, row, col, answer } = clue;
    const tag = `Down ${number} "${answer}"`;

    if (isBlackV(row, col)) {
      errors.push(`${tag}: starting cell (${row},${col}) is black or out of bounds`);
      continue;
    }

    // Rule 2: top cell must be boundary
    if (!isBlackV(row - 1, col)) {
      errors.push(
        `${tag}: starts at (${row},${col}) but (${row - 1},${col}) is not a boundary — clue starts mid-word`
      );
    }

    // Rule 4: measure the uninterrupted run downward
    let run = 0;
    for (let r = row; r < gridSize; r++) {
      if (isBlackV(r, col)) break;
      run++;
    }

    if (run !== answer.length) {
      errors.push(
        `${tag}: answer has ${answer.length} letters but cell run at (${row},${col}) is ${run} cells`
      );
    }
  }

  // ── Rule 5: Intersection letter consistency ──────────────────────────────────
  const letterMap = {};  // key: "row-col" → { letter, source }

  const registerLetter = (r, c, letter, source) => {
    const key = `${r}-${c}`;
    const L   = letter.toUpperCase();
    if (letterMap[key]) {
      if (letterMap[key].letter !== L) {
        errors.push(
          `Letter conflict at (${r},${c}): ` +
          `${letterMap[key].source} says "${letterMap[key].letter}", ` +
          `${source} says "${L}"`
        );
      }
    } else {
      letterMap[key] = { letter: L, source };
    }
  };

  for (const clue of across) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.row, c = clue.col + i;
      if (!isBlackV(r, c)) registerLetter(r, c, clue.answer[i], `Across ${clue.number}[${i}]`);
    }
  }

  for (const clue of down) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.row + i, c = clue.col;
      if (!isBlackV(r, c)) registerLetter(r, c, clue.answer[i], `Down ${clue.number}[${i}]`);
    }
  }

  // ── Rule 6: Orphan cell detection ───────────────────────────────────────────
  const coveredKeys = new Set(Object.keys(letterMap));

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isBlackV(r, c) && !coveredKeys.has(`${r}-${c}`)) {
        errors.push(`Orphan cell at (${r},${c}): not covered by any clue`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Validation error UI ───────────────────────────────────────────────────────
function showValidationError(puzzleId, errors) {
  // Full details in console for developer
  console.error(`[Crossword Validation] Puzzle "${puzzleId}" is invalid — ${errors.length} error(s):`);
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));

  // Hide normal game UI
  const gameArea = document.getElementById('game-area');
  if (gameArea) gameArea.hidden = true;

  // Show error panel
  const panel = document.getElementById('validation-error');
  if (!panel) return;
  panel.hidden = false;

  document.getElementById('ve-puzzle-id').textContent    = puzzleId;
  document.getElementById('ve-error-count').textContent  =
    `${errors.length} error${errors.length !== 1 ? 's' : ''} detected`;

  const list = document.getElementById('ve-error-list');
  list.innerHTML = '';
  errors.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    list.appendChild(li);
  });
}

// =============================================================================
// MAP BUILDERS
// =============================================================================
function buildMaps() {
  solutionMap = {};
  cellMap     = {};

  for (const clue of puzzle.clues.across) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.row, c = clue.col + i;
      if (isBlack(r, c)) continue;
      const key = `${r},${c}`;
      solutionMap[key] = clue.answer[i].toUpperCase();
      if (!cellMap[key]) cellMap[key] = { across: null, down: null };
      cellMap[key].across = clue;
    }
  }

  for (const clue of puzzle.clues.down) {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.row + i, c = clue.col;
      if (isBlack(r, c)) continue;
      const key = `${r},${c}`;
      solutionMap[key] = clue.answer[i].toUpperCase();
      if (!cellMap[key]) cellMap[key] = { across: null, down: null };
      cellMap[key].down = clue;
    }
  }
}

// ── Grid renderer ─────────────────────────────────────────────────────────────
function renderGrid() {
  const container = document.getElementById('crossword-grid');
  container.style.gridTemplateColumns = `repeat(${puzzle.gridSize}, 1fr)`;
  container.innerHTML = '';

  for (let r = 0; r < puzzle.gridSize; r++) {
    for (let c = 0; c < puzzle.gridSize; c++) {
      const raw  = puzzle.grid[r] ? puzzle.grid[r][c] : '#';
      const cell = document.createElement('div');
      cell.className   = 'xw-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (raw === '#') {
        cell.classList.add('xw-black');
      } else {
        const num = getClueNumberAt(r, c);
        if (num !== null) {
          const lbl = document.createElement('span');
          lbl.className   = 'xw-num';
          lbl.textContent = num;
          cell.appendChild(lbl);
        }

        const inp = document.createElement('input');
        inp.type           = 'text';
        inp.maxLength      = 1;
        inp.className      = 'xw-input';
        inp.dataset.row    = r;
        inp.dataset.col    = c;
        inp.autocomplete   = 'off';
        inp.autocorrect    = 'off';
        inp.autocapitalize = 'characters';
        inp.spellcheck     = false;

        inp.addEventListener('focus',   ()  => onFocus(r, c));
        inp.addEventListener('click',   ()  => onClick(r, c));
        inp.addEventListener('keydown', (e) => onKeydown(e, r, c));
        inp.addEventListener('input',   (e) => onInput(e, r, c));

        cell.appendChild(inp);
      }

      container.appendChild(cell);
    }
  }
}

function getClueNumberAt(r, c) {
  let min = null;
  for (const clue of [...puzzle.clues.across, ...puzzle.clues.down]) {
    if (clue.row === r && clue.col === c) {
      if (min === null || clue.number < min) min = clue.number;
    }
  }
  return min;
}

// ── Clue list renderer ────────────────────────────────────────────────────────
function renderClues() {
  const acrossEl = document.getElementById('clues-across');
  const downEl   = document.getElementById('clues-down');
  acrossEl.innerHTML = '';
  downEl.innerHTML   = '';

  for (const clue of puzzle.clues.across) acrossEl.appendChild(makeClueEl(clue, 'across'));
  for (const clue of puzzle.clues.down)   downEl.appendChild(makeClueEl(clue, 'down'));
}

function makeClueEl(clue, dir) {
  const li = document.createElement('li');
  li.className         = 'clue-item';
  li.dataset.number    = clue.number;
  li.dataset.direction = dir;
  li.innerHTML = `<span class="clue-num">${clue.number}</span><span class="clue-text">${esc(clue.clue)}</span>`;
  li.addEventListener('click', () => {
    activateClue(clue, dir);
    (getFirstEmptyInput(clue, dir) ?? getInput(clue.row, clue.col))?.focus();
  });
  return li;
}

// ── Timer ─────────────────────────────────────────────────────────────────────
function startTimer() {
  if (gameStarted) return;
  gameStarted = true;
  timerHandle = setInterval(() => { timerValue++; updateTimerDisplay(); }, 1000);
}

function stopTimer()       { clearInterval(timerHandle); timerHandle = null; }

function updateTimerDisplay() {
  const m  = String(Math.floor(timerValue / 60)).padStart(2, '0');
  const s  = String(timerValue % 60).padStart(2, '0');
  const el = document.getElementById('timer');
  if (el) el.textContent = `${m}:${s}`;
}

// ── Cell event handlers ───────────────────────────────────────────────────────
function onFocus(r, c) {
  if (gameOver) return;
  startTimer();
  const entry = cellMap[`${r},${c}`];
  if (!entry) return;
  let dir = activeDir;
  if (!entry[dir]) dir = entry.across ? 'across' : 'down';
  activateClue(entry[dir], dir);
}

function onClick(r, c) {
  if (gameOver) return;
  const entry = cellMap[`${r},${c}`];
  if (!entry) return;
  const isCurrentCell = activeClue &&
    (activeDir === 'across'
      ? activeClue.row === r && c >= activeClue.col && c < activeClue.col + activeClue.answer.length
      : activeClue.col === c && r >= activeClue.row && r < activeClue.row + activeClue.answer.length);
  if (isCurrentCell) {
    const other = activeDir === 'across' ? 'down' : 'across';
    if (entry[other]) { activateClue(entry[other], other); return; }
  }
}

function onKeydown(e, r, c) {
  if (gameOver) { e.preventDefault(); return; }

  if (e.key === 'Backspace') {
    e.preventDefault();
    const inp = getInput(r, c);
    if (inp.value) {
      inp.value = '';
      inp.classList.remove('cell-correct', 'cell-wrong');
    } else {
      const prev = prevCell(r, c);
      if (prev) {
        const pi = getInput(prev.r, prev.c);
        if (pi) { pi.value = ''; pi.classList.remove('cell-correct', 'cell-wrong'); pi.focus(); }
      }
    }
    return;
  }

  const moves = { ArrowRight:[0,1], ArrowLeft:[0,-1], ArrowDown:[1,0], ArrowUp:[-1,0] };
  if (moves[e.key]) {
    e.preventDefault();
    const [dr, dc] = moves[e.key];
    moveFocus(r + dr, c + dc);
    return;
  }

  if (e.key === 'Tab') { e.preventDefault(); cycleClue(e.shiftKey); return; }
}

function onInput(e, r, c) {
  if (gameOver) return;
  const inp = getInput(r, c);
  const val = inp.value.toUpperCase().replace(/[^A-Z]/g, '');
  inp.value = val;
  inp.classList.remove('cell-correct', 'cell-wrong');
  if (val) advanceToNext(r, c);
}

// ── Clue activation & highlighting ───────────────────────────────────────────
function activateClue(clue, dir) {
  if (!clue) return;
  activeClue = clue;
  activeDir  = dir;

  document.querySelectorAll('.xw-cell').forEach(el =>
    el.classList.remove('xw-highlight', 'xw-active-cell'));
  document.querySelectorAll('.clue-item').forEach(el =>
    el.classList.remove('clue-active'));

  for (let i = 0; i < clue.answer.length; i++) {
    const cr = dir === 'across' ? clue.row     : clue.row + i;
    const cc = dir === 'across' ? clue.col + i : clue.col;
    if (isBlack(cr, cc)) continue;
    getCellEl(cr, cc)?.classList.add('xw-highlight');
  }

  getCellEl(clue.row, clue.col)?.classList.add('xw-active-cell');

  const clueEl = document.querySelector(
    `.clue-item[data-number="${clue.number}"][data-direction="${dir}"]`
  );
  if (clueEl) { clueEl.classList.add('clue-active'); clueEl.scrollIntoView({ block: 'nearest' }); }
}

function cycleClue(reverse) {
  const all = [
    ...puzzle.clues.across.map(c => ({ clue: c, dir: 'across' })),
    ...puzzle.clues.down.map(c   => ({ clue: c, dir: 'down'   })),
  ];
  const idx  = all.findIndex(x => x.clue === activeClue && x.dir === activeDir);
  const next = reverse
    ? all[(idx - 1 + all.length) % all.length]
    : all[(idx + 1) % all.length];
  if (next) { activateClue(next.clue, next.dir); getInput(next.clue.row, next.clue.col)?.focus(); }
}

// ── Movement helpers ──────────────────────────────────────────────────────────
function advanceToNext(r, c) {
  if (!activeClue) return;
  const dr  = activeDir === 'down'   ? 1 : 0;
  const dc  = activeDir === 'across' ? 1 : 0;
  const nr  = r + dr, nc = c + dc;
  const endR = activeDir === 'across' ? activeClue.row : activeClue.row + activeClue.answer.length - 1;
  const endC = activeDir === 'across' ? activeClue.col + activeClue.answer.length - 1 : activeClue.col;
  if (nr <= endR && nc <= endC) getInput(nr, nc)?.focus();
}

function prevCell(r, c) {
  if (!activeClue) return null;
  const dr = activeDir === 'down'   ? 1 : 0;
  const dc = activeDir === 'across' ? 1 : 0;
  const pr = r - dr, pc = c - dc;
  if (pr >= activeClue.row && pc >= activeClue.col) return { r: pr, c: pc };
  return null;
}

function moveFocus(r, c) {
  if (r < 0 || r >= puzzle.gridSize || c < 0 || c >= puzzle.gridSize) return;
  getInput(r, c)?.focus();
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function getInput(r, c)  { return document.querySelector(`.xw-input[data-row="${r}"][data-col="${c}"]`); }
function getCellEl(r, c) { return document.querySelector(`.xw-cell[data-row="${r}"][data-col="${c}"]`); }

function getFirstEmptyInput(clue, dir) {
  for (let i = 0; i < clue.answer.length; i++) {
    const r   = dir === 'across' ? clue.row     : clue.row + i;
    const c   = dir === 'across' ? clue.col + i : clue.col;
    const inp = getInput(r, c);
    if (inp && !inp.value) return inp;
  }
  return null;
}

// ── Check answers ─────────────────────────────────────────────────────────────
function checkAnswers() {
  if (gameOver) return;
  stopTimer();
  gameOver = true;

  let correct = 0, total = 0;
  for (const [key, letter] of Object.entries(solutionMap)) {
    const [r, c] = key.split(',').map(Number);
    const inp    = getInput(r, c);
    const cel    = getCellEl(r, c);
    if (!inp) continue;
    total++;
    if (inp.value.toUpperCase() === letter) { correct++; cel?.classList.add('cell-correct'); }
    else                                    {            cel?.classList.add('cell-wrong');   }
    inp.disabled = true;
  }

  const score = Math.max(0, Math.floor((correct / total) * 1000 - timerValue));
  showResults(correct, total, score);

  submitScore({
    usn:  player.usn,
    game: 'crossword',
    score,
    meta: { puzzleId: puzzle.id, correctLetters: correct, totalLetters: total, timeTaken: timerValue },
  });
}

// ── Results ───────────────────────────────────────────────────────────────────
function showResults(correct, total, score) {
  document.getElementById('res-correct').textContent = correct;
  document.getElementById('res-total').textContent   = total;
  document.getElementById('res-score').textContent   = score;
  document.getElementById('res-time').textContent    = document.getElementById('timer').textContent;
  const sec = document.getElementById('results-section');
  sec.hidden = false;
  sec.scrollIntoView({ behavior: 'smooth' });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
async function showLeaderboard() {
  const sec = document.getElementById('lb-section');
  sec.hidden = false;
  sec.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('lb-loading').hidden = false;
  document.getElementById('lb-body').innerHTML = '';

  const rows = await loadLeaderboard('crossword');
  document.getElementById('lb-loading').hidden = true;

  if (!rows.length) {
    document.getElementById('lb-body').innerHTML =
      '<tr><td colspan="4" style="text-align:center;color:#6b7fa3">No scores yet.</td></tr>';
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');
    if (row.usn === player.usn) tr.classList.add('lb-mine');
    tr.innerHTML = `
      <td class="lb-rank">${row.rank}</td>
      <td>${esc(row.username)}</td>
      <td class="lb-usn">${esc(row.usn)}</td>
      <td class="lb-score">${row.score}</td>
    `;
    document.getElementById('lb-body').appendChild(tr);
  });
}

// ── Restart ───────────────────────────────────────────────────────────────────
function restartGame() {
  puzzle      = crosswords[Math.floor(Math.random() * crosswords.length)];
  activeClue  = null;
  activeDir   = 'across';
  timerValue  = 0;
  gameStarted = false;
  gameOver    = false;
  stopTimer();
  updateTimerDisplay();

  // Reset panel visibility
  const errPanel = document.getElementById('validation-error');
  const gameArea = document.getElementById('game-area');
  if (errPanel) errPanel.hidden = true;
  if (gameArea) gameArea.hidden = false;

  const validation = validateCrossword(puzzle);
  if (!validation.valid) {
    showValidationError(puzzle.id ?? 'unknown', validation.errors);
    return;
  }

  buildMaps();
  renderGrid();
  renderClues();
  document.getElementById('results-section').hidden = true;
  document.getElementById('lb-section').hidden      = true;
}

// ── Utility ───────────────────────────────────────────────────────────────────
function isBlack(r, c) {
  return !puzzle.grid[r] || puzzle.grid[r][c] === '#';
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
