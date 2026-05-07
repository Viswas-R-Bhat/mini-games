// 3 crosswords — sequential unlock.
// Puzzle 1 (Round 1): General Knowledge (Easy)
// Puzzle 2 (Round 2): Basic CS (Medium)
// Puzzle 3 (Round 3): Hard CS

export const crosswords = [
  // ── PUZZLE 1 — General Knowledge (Easy) ──────────────────────────
  {
    id: 'gk-easy',
    title: 'General Knowledge',
    difficulty: 'easy',
    gridSize: { rows: 7, cols: 5 },
    grid: [
      [  0,  'G', 'O', 'L', 'D' ],
      [  0,  'R',  0,   0,   0  ],
      [ 'W', 'A', 'T', 'E', 'R' ],
      [  0,  'V',  0,   0,  'A' ],
      [  0,  'I',  0,   0,  'D' ],
      [  0,  'T',  0,   0,  'I' ],
      [  0,  'Y',  0,   0,  'O' ],
    ],
    across: [
      { clue: 1, row: 0, col: 1, answer: 'GOLD',  text: 'Precious metal with chemical symbol Au' },
      { clue: 3, row: 2, col: 0, answer: 'WATER', text: 'H₂O — essential compound for life' },
    ],
    down: [
      { clue: 2, row: 0, col: 1, answer: 'GRAVITY', text: 'Force discovered by Newton that keeps us grounded' },
      { clue: 4, row: 2, col: 4, answer: 'RADIO',   text: 'Device used to receive broadcast signals wirelessly' },
    ],
  },

  // ── PUZZLE 2 — Basic CS (Medium) ─────────────────────────────────
  {
    id: 'cs-basics',
    title: 'CS Fundamentals',
    difficulty: 'medium',
    gridSize: { rows: 5, cols: 5 },
    grid: [
      [ 'L', 'O', 'O', 'P',  0  ],
      [ 'O',  0,   0,   0,   0  ],
      [ 'G',  0,   0,   0,   0  ],
      [ 'I',  0,   0,   0,   0  ],
      [ 'C', 'L', 'A', 'S', 'S' ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, answer: 'LOOP',  text: 'Programming construct for repeating instructions' },
      { clue: 3, row: 4, col: 0, answer: 'CLASS', text: 'Blueprint for creating objects in OOP' },
    ],
    down: [
      { clue: 2, row: 0, col: 0, answer: 'LOGIC', text: 'Foundation of computer science dealing with true/false reasoning' },
    ],
  },

  // ── PUZZLE 3 — Hard CS ───────────────────────────────────────────
  {
    id: 'cs-hard',
    title: 'Advanced CS',
    difficulty: 'hard',
    gridSize: { rows: 11, cols: 11 },
    grid: [
      [ 'H', 'E', 'I', 'S', 'E', 'N', 'B', 'U', 'G',  0,   0  ],
      [ 'Y',  0,   0,  'P',  0,  'O', 'I',  0,  'E',  0,   0  ],
      [ 'P', 'I', 'D', 'E', 'M', 'P', 'O', 'T', 'E', 'N', 'T' ],
      [ 'E',  0,   0,  'C',  0,   0,  'S',  0,  'K',  0,  'H' ],
      [ 'R', 'E', 'C', 'U', 'R', 'S', 'I', 'O', 'N',  0,  'R' ],
      [ 'V',  0,   0,  'L',  0,   0,  'N',  0,  'O',  0,  'E' ],
      [ 'I',  0,   0,  'A',  0,   0,  'D',  0,  'D',  0,  'A' ],
      [ 'S',  0,   0,  'T',  0,   0,  'E',  0,  'E',  0,  'D' ],
      [ 'O',  0,   0,  'I',  0,   0,  'X',  0,   0,   0,   0  ],
      [ 'R',  0,   0,  'V',  0,   0,   0,   0,   0,   0,   0  ],
      [  0,   0,   0,  'E',  0,   0,   0,   0,   0,   0,   0  ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, answer: 'HEISENBUG',  text: 'A software anomaly that disappears when you try to probe it' },
      { clue: 6, row: 2, col: 1, answer: 'IDEMPOTENT', text: 'Property where an operation has the same effect executed once or many times' },
      { clue: 8, row: 4, col: 0, answer: 'RECURSION',  text: 'To understand this, you must first understand this' },
    ],
    down: [
      { clue: 1, row: 0, col: 0, answer: 'HYPERVISOR', text: 'Software that creates and runs virtual machines' },
      { clue: 2, row: 0, col: 3, answer: 'SPECULATIVE', text: 'CPU execution technique performing tasks that may not be needed' },
      { clue: 3, row: 0, col: 5, answer: 'NOP',         text: 'Assembly instruction that does absolutely nothing' },
      { clue: 4, row: 0, col: 6, answer: 'BIOS',        text: 'Legacy firmware for hardware initialization at boot' },
      { clue: 5, row: 0, col: 8, answer: 'GEEK',        text: 'Slang for a person with intense interest in tech' },
      { clue: 7, row: 2, col: 10, answer: 'THREAD',     text: 'Smallest sequence of instructions managed by a scheduler' },
      { clue: 9, row: 4, col: 6, answer: 'INDEX',       text: 'Database structure that speeds up data retrieval' },
      { clue: 10, row: 4, col: 8, answer: 'NODE',       text: 'Fundamental unit in a linked list or tree' },
    ],
  },
];
