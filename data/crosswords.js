// 3 crosswords — sequential unlock.
// Puzzle 1 (Round 1): General Knowledge (Easy) — 7 words
// Puzzle 2 (Round 2): Basic CS (Medium)
// Puzzle 3 (Round 3): Hard CS
// Grid letters and answers are encoded to prevent inspection via DevTools.

export const crosswords = [
  // ── PUZZLE 1 — General Knowledge (Easy) ──────────────────────────
  {
    id: 'gk-easy',
    title: 'General Knowledge',
    difficulty: 'easy',
    gridSize: { rows: 5, cols: 5 },
    grid: [
      [ 'Gw==', 'Fw==', 'BA==', 'BQ==',  0  ],
      [ 'Aw==', 'Ag==', 'Dw==', 'Bg==', 'Ew==' ],
      [ 'BQ==', 'GQ==', 'Gg==', 'Fw==', 'BA==' ],
      [ 'Hw==', 'Gw==',  0,  'FQ==',  0  ],
      [ 'FQ==', 'GQ==', 'Eg==', 'Ew==',  0  ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, _a: 'GyAgEg==', len: 4, text: 'The fourth planet, known as the Red Planet' },
      { clue: 4, row: 1, col: 1, _a: 'AjgiBA==', len: 4, text: 'To input text using a keyboard' },
      { clue: 5, row: 2, col: 0, _a: 'BS4+ABs=', len: 5, text: 'Relating to the Sun — ___ system, ___ energy' },
      { clue: 6, row: 4, col: 0, _a: 'FS42BA==', len: 4, text: 'Instructions for a computer, or a secret cipher' },
    ],
    down: [
      { clue: 1, row: 0, col: 0, _a: 'GzQhCAo=', len: 5, text: 'Art form combining rhythm, melody, and harmony' },
      { clue: 2, row: 0, col: 1, _a: 'FzU9DA==', len: 4, text: 'Smallest unit of a chemical element' },
      { clue: 3, row: 0, col: 3, _a: 'BTEzAgw=', len: 5, text: 'The vast expanse beyond Earth\'s atmosphere' },
    ],
  },

  // ── PUZZLE 2 — Basic CS (Medium) ─────────────────────────────────
  {
    id: 'cs-basics',
    title: 'CS Fundamentals',
    difficulty: 'medium',
    gridSize: { rows: 11, cols: 12 },
    grid: [
      [  0 , 'Bw==',  0 ,  0 ,  0 ,  0 , 'BQ==', 'Ag==', 'Fw==', 'FQ==', 'HQ==',  0  ],
      [  0 , 'Aw==',  0 ,  0 ,  0 ,  0 , 'GQ==',  0 ,  0 ,  0 ,  0 ,  0  ],
      [  0 , 'Ew==',  0 ,  0 ,  0 , 'Fw==', 'BA==', 'BA==', 'Fw==', 'Dw==',  0 ,  0  ],
      [  0 , 'Aw==',  0 ,  0 ,  0 ,  0 , 'Ag==',  0 ,  0 ,  0 ,  0 ,  0  ],
      [ 'BA==', 'Ew==', 'FQ==', 'Aw==', 'BA==', 'BQ==', 'Hw==', 'GQ==', 'GA==',  0 ,  0 ,  0  ],
      [  0 ,  0 , 'Hg==',  0 ,  0 ,  0 , 'GA==',  0 , 'BQ==',  0 ,  0 ,  0  ],
      [  0 ,  0 , 'Fw==', 'Eg==',  0 ,  0 , 'EQ==', 'BA==', 'Ew==', 'Ew==', 'Eg==', 'Dw==' ],
      [  0 , 'Ag==', 'BA==', 'Ew==', 'Ew==', 'BQ==',  0 ,  0 , 'Ag==',  0 ,  0 ,  0  ],
      [  0 ,  0 ,  0 , 'Bw==',  0 ,  0 ,  0 ,  0 , 'BQ==',  0 ,  0 ,  0  ],
      [  0 ,  0 ,  0 , 'Aw==',  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0  ],
      [  0 ,  0 ,  0 , 'Ew==',  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0  ],
    ],
    across: [
      { clue: 2, row: 0, col: 6, _a: 'BTUzAgI=', len: 5, text: 'Last-in, first-out data structure' },
      { clue: 6, row: 7, col: 1, _a: 'AjM3BBo=', len: 5, text: 'Hierarchical data structures with a root node' },
      { clue: 7, row: 6, col: 6, _a: 'ETM3BA03', len: 6, text: 'Algorithmic paradigm that makes locally optimal choices' },
      { clue: 8, row: 2, col: 5, _a: 'FzMgABA=', len: 5, text: 'Contiguous block of memory holding elements' },
      { clue: 9, row: 4, col: 0, _a: 'BCQxFBs9Kip8', len: 9, text: 'Function that calls itself' },
    ],
    down: [
      { clue: 1, row: 0, col: 1, _a: 'BzQ3FAw=', len: 5, text: 'First-in, first-out data structure' },
      { clue: 2, row: 0, col: 6, _a: 'BS4gFQAgJA==', len: 7, text: 'Arranging data in a specific order' },
      { clue: 3, row: 5, col: 8, _a: 'BSQmEg==', len: 4, text: 'Collections of unique elements' },
      { clue: 4, row: 6, col: 3, _a: 'EiQjFAw=', len: 5, text: 'Double-ended queue' },
      { clue: 5, row: 4, col: 2, _a: 'FSkzEw==', len: 4, text: 'Single letter data type' },
    ],
  },

  // ── PUZZLE 3 — Hard CS ───────────────────────────────────────────
  {
    id: 'cs-hard',
    title: 'Advanced CS',
    difficulty: 'hard',
    gridSize: { rows: 11, cols: 12 },
    grid: [
      [ 'Eg==', 'Ew==', 'FQ==', 'Hw==', 'Gw==', 'Fw==', 'Gg==',  0 ,  0 , 'FA==', 'Aw==', 'EQ==' ],
      [ 'Ew==',  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 , 'Fw==',  0 ,  0  ],
      [ 'AA==',  0 ,  0 ,  0 ,  0 ,  0 ,  0 , 'FQ==', 'Fw==', 'FQ==', 'Hg==', 'Ew==' ],
      [ 'Hw==',  0 , 'AA==',  0 ,  0 ,  0 ,  0 ,  0 ,  0 , 'HQ==',  0 ,  0  ],
      [ 'FQ==',  0 , 'Ew==',  0 ,  0 ,  0 ,  0 ,  0 ,  0 , 'Ew==',  0 ,  0  ],
      [ 'Ew==', 'GA==', 'FQ==', 'BA==', 'Dw==', 'Bg==', 'Ag==', 'Hw==', 'GQ==', 'GA==',  0 ,  0  ],
      [ 'BQ==',  0 , 'Ag==',  0 ,  0 , 'Dw==',  0 ,  0 ,  0 , 'Eg==',  0 ,  0  ],
      [  0 ,  0 , 'GQ==',  0 ,  0 , 'Ag==',  0 ,  0 ,  0 ,  0 ,  0 ,  0  ],
      [  0 ,  0 , 'BA==',  0 ,  0 , 'Hg==',  0 ,  0 ,  0 , 'Bg==',  0 ,  0  ],
      [  0 ,  0 ,  0 ,  0 , 'BQ==', 'GQ==', 'EA==', 'Ag==', 'AQ==', 'Fw==', 'BA==', 'Ew==' ],
      [  0 ,  0 ,  0 ,  0 ,  0 , 'GA==',  0 ,  0 ,  0 , 'GA==',  0 ,  0  ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, _a: 'EiQxCAQvLw==', len: 7, text: 'Base-10 number system' },
      { clue: 2, row: 0, col: 9, _a: 'FDQ1', len: 3, text: 'An error in a program' },
      { clue: 3, row: 2, col: 7, _a: 'FSAxCQw=', len: 5, text: 'High-speed hardware memory' },
      { clue: 5, row: 5, col: 0, _a: 'Ey8xExA+Nyx9fg==', len: 10, text: 'Securing data by encoding it' },
      { clue: 7, row: 9, col: 4, _a: 'BS40FR4vMSA=', len: 8, text: 'Programs running on a computer' },
    ],
    down: [
      { clue: 1, row: 0, col: 0, _a: 'EiQkCAorMA==', len: 7, text: 'Hardware components' },
      { clue: 2, row: 0, col: 9, _a: 'FCAxCgwgJw==', len: 7, text: 'Server-side logic of an application' },
      { clue: 4, row: 3, col: 2, _a: 'ACQxFQY8', len: 6, text: 'Dynamic array in C++' },
      { clue: 6, row: 5, col: 5, _a: 'BjgmCQYg', len: 6, text: 'Popular language named after a comedy group' },
      { clue: 8, row: 8, col: 9, _a: 'BiA8', len: 3, text: 'Personal Area Network (Abbr.)' },
    ],
  },
];
