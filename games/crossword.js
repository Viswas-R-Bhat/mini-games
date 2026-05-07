import { initPlayer, submitScore } from '../lib/submitScore.js';
import { loadLeaderboard } from '../lib/leaderboard.js';
import { crosswords } from '../data/crosswords.js';

let player = null;
let puzzle = null;

let solutionMap = {};
let cellMap = {};

let activeClue = null;
let activeDir = 'across';

document.addEventListener('DOMContentLoaded', async () => {
  player = await initPlayer();
  puzzle = crosswords[Math.floor(Math.random() * crosswords.length)];

  buildMaps();
  renderGrid();
  renderClues();
});

// -----------------------------------------------------------------------------
// BUILD MAPS
// -----------------------------------------------------------------------------
function buildMaps() {
  const { gridSize, grid, clues } = puzzle;

  for (const clue of [...clues.across, ...clues.down]) {
    const { row, col, answer } = clue;
    const dir = clues.across.includes(clue) ? 'across' : 'down';

    for (let i = 0; i < answer.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      const key = `${r}-${c}`;

      if (!solutionMap[key]) solutionMap[key] = {};
      solutionMap[key][dir] = clue;
    }
  }
}

// -----------------------------------------------------------------------------
// RENDER GRID
// -----------------------------------------------------------------------------
function renderGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';

  const { gridSize, grid } = puzzle;

  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement('input');
      cell.maxLength = 1;
      cell.className = 'cell';

      if (grid[r][c] === '#') {
        cell.classList.add('black');
        cell.disabled = true;
      } else {
        const key = `${r}-${c}`;
        cellMap[key] = cell;

        cell.addEventListener('click', () => handleCellClick(r, c));
        cell.addEventListener('input', () => moveNext(r, c));
      }

      gridEl.appendChild(cell);
    }
  }
}

// -----------------------------------------------------------------------------
// CLUES
// -----------------------------------------------------------------------------
function renderClues() {
  const acrossEl = document.getElementById('across-clues');
  const downEl = document.getElementById('down-clues');

  acrossEl.innerHTML = '';
  downEl.innerHTML = '';

  for (const clue of puzzle.clues.across) {
    const div = createClueDiv(clue, 'across');
    acrossEl.appendChild(div);
  }

  for (const clue of puzzle.clues.down) {
    const div = createClueDiv(clue, 'down');
    downEl.appendChild(div);
  }
}

function createClueDiv(clue, dir) {
  const div = document.createElement('div');
  div.className = 'clue';
  div.textContent = `${clue.number}. ${clue.clue}`;
  div.addEventListener('click', () => activateClue(clue, dir));
  return div;
}

// -----------------------------------------------------------------------------
// CLUE ACTIVATION (FIXED)
// -----------------------------------------------------------------------------
function activateClue(clue, dir) {
  activeClue = clue;
  activeDir = dir;

  clearHighlights();

  const { row, col, answer } = clue;

  for (let i = 0; i < answer.length; i++) {
    const r = dir === 'across' ? row : row + i;
    const c = dir === 'across' ? col + i : col;

    const cell = cellMap[`${r}-${c}`];
    if (!cell) continue;

    cell.classList.add('active');

    if (i === 0) cell.focus();
  }
}

function clearHighlights() {
  Object.values(cellMap).forEach(c => c.classList.remove('active'));
}

// -----------------------------------------------------------------------------
// CELL CLICK (FIXED)
// -----------------------------------------------------------------------------
function handleCellClick(r, c) {
  const key = `${r}-${c}`;
  const info = solutionMap[key];

  if (!info) return;

  if (activeDir === 'across' && info.across) {
    activateClue(info.across, 'across');
  } else if (info.down) {
    activateClue(info.down, 'down');
  } else if (info.across) {
    activateClue(info.across, 'across');
  }
}

// -----------------------------------------------------------------------------
// AUTO MOVE (FIXED)
// -----------------------------------------------------------------------------
function moveNext(r, c) {
  if (!activeClue) return;

  const { row, col, answer } = activeClue;

  for (let i = 0; i < answer.length; i++) {
    const rr = activeDir === 'across' ? row : row + i;
    const cc = activeDir === 'across' ? col + i : col;

    if (rr === r && cc === c) {
      const next = i + 1;
      if (next < answer.length) {
        const nr = activeDir === 'across' ? row : row + next;
        const nc = activeDir === 'across' ? col + next : col;
        cellMap[`${nr}-${nc}`]?.focus();
      }
      break;
    }
  }
}
