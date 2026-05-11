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
    gridSize: { rows: 5, cols: 5 },
    grid: [
      [ 'Gg==', 'GQ==', 'GQ==', 'Bg==',  0  ],
      [ 'GQ==',  0,   0,   0,   0  ],
      [ 'EQ==',  0,   0,   0,   0  ],
      [ 'Hw==',  0,   0,   0,   0  ],
      [ 'FQ==', 'Gg==', 'Fw==', 'BQ==', 'BQ==' ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, _a: 'Gi49EQ==', len: 4, text: 'Programming construct for repeating instructions' },
      { clue: 3, row: 4, col: 0, _a: 'FS0zEho=', len: 5, text: 'Blueprint for creating objects in OOP' },
    ],
    down: [
      { clue: 2, row: 0, col: 0, _a: 'Gi41CAo=', len: 5, text: 'Foundation of computer science dealing with true/false reasoning' },
    ],
  },

  // ── PUZZLE 3 — Hard CS ───────────────────────────────────────────
  {
    id: 'cs-hard',
    title: 'Advanced CS',
    difficulty: 'hard',
    gridSize: { rows: 11, cols: 11 },
    grid: [
      [ 'Hg==', 'Ew==', 'Hw==', 'BQ==', 'Ew==', 'GA==', 'FA==', 'Aw==', 'EQ==',  0,   0  ],
      [ 'Dw==',  0,   0,  'Bg==',  0,  'GQ==', 'Hw==',  0,  'Ew==',  0,   0  ],
      [ 'Bg==', 'Hw==', 'Eg==', 'Ew==', 'Gw==', 'Bg==', 'GQ==', 'Ag==', 'Ew==', 'GA==', 'Ag==' ],
      [ 'Ew==',  0,   0,  'FQ==',  0,   0,  'BQ==',  0,  'HQ==',  0,  'Hg==' ],
      [ 'BA==', 'Ew==', 'FQ==', 'Aw==', 'BA==', 'BQ==', 'Hw==', 'GQ==', 'GA==',  0,  'BA==' ],
      [ 'AA==',  0,   0,  'Gg==',  0,   0,  'GA==',  0,  'GQ==',  0,  'Ew==' ],
      [ 'Hw==',  0,   0,  'Fw==',  0,   0,  'Eg==',  0,  'Eg==',  0,  'Fw==' ],
      [ 'BQ==',  0,   0,  'Ag==',  0,   0,  'Ew==',  0,  'Ew==',  0,  'Eg==' ],
      [ 'GQ==',  0,   0,  'Hw==',  0,   0,  'Dg==',  0,   0,   0,   0  ],
      [ 'BA==',  0,   0,  'AA==',  0,   0,   0,   0,   0,   0,   0  ],
      [  0,   0,   0,  'Ew==',  0,   0,   0,   0,   0,   0,   0  ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, _a: 'HiQ7EgwgITB1', len: 9, text: 'A software anomaly that disappears when you try to probe it' },
      { clue: 6, row: 2, col: 1, _a: 'HyU3DBkhNyB8ZA==', len: 10, text: 'Property where an operation has the same effect executed once or many times' },
      { clue: 8, row: 4, col: 0, _a: 'BCQxFBs9Kip8', len: 9, text: 'To understand this, you must first understand this' },
    ],
    down: [
      { clue: 1, row: 0, col: 0, _a: 'HjgiBBs4KjZ9Yg==', len: 10, text: 'Software that creates and runs virtual machines' },
      { clue: 2, row: 0, col: 3, _a: 'BTE3AhwiIjF7Znc=', len: 11, text: 'CPU execution technique performing tasks that may not be needed' },
      { clue: 3, row: 0, col: 5, _a: 'GC4i', len: 3, text: 'Assembly instruction that does absolutely nothing' },
      { clue: 4, row: 0, col: 6, _a: 'FCg9Eg==', len: 4, text: 'Legacy firmware for hardware initialization at boot' },
      { clue: 5, row: 0, col: 8, _a: 'ESQ3Cg==', len: 4, text: 'Slang for a person with intense interest in tech' },
      { clue: 7, row: 2, col: 10, _a: 'AikgBAgq', len: 6, text: 'Smallest sequence of instructions managed by a scheduler' },
      { clue: 9, row: 4, col: 6, _a: 'Hy82BBE=', len: 5, text: 'Database structure that speeds up data retrieval' },
      { clue: 10, row: 4, col: 8, _a: 'GC42BA==', len: 4, text: 'Fundamental unit in a linked list or tree' },
    ],
  },
];
