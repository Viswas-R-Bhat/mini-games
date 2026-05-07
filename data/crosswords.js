// 3 crosswords — sequential unlock.
// Puzzle 1 (Round 1): General Knowledge (Easy) — 7 words
// Puzzle 2 (Round 2): Basic CS (Medium)
// Puzzle 3 (Round 3): Hard CS

export const crosswords = [
  // ── PUZZLE 1 — General Knowledge (Easy) ──────────────────────────
  //   M A R S ·        Across: 1-MARS, 4-TYPE, 5-SOLAR, 6-CODE
  //   U T Y P E        Down:   1-MUSIC, 2-ATOM, 3-SPACE
  //   S O L A R
  //   I M · C ·
  //   C O D E ·
  {
    id: 'gk-easy',
    title: 'General Knowledge',
    difficulty: 'easy',
    gridSize: { rows: 5, cols: 5 },
    grid: [
      [ 'M', 'A', 'R', 'S',  0  ],
      [ 'U', 'T', 'Y', 'P', 'E' ],
      [ 'S', 'O', 'L', 'A', 'R' ],
      [ 'I', 'M',  0,  'C',  0  ],
      [ 'C', 'O', 'D', 'E',  0  ],
    ],
    across: [
      { clue: 1, row: 0, col: 0, answer: 'MARS',  text: 'The fourth planet, known as the Red Planet' },
      { clue: 4, row: 1, col: 1, answer: 'TYPE',  text: 'To input text using a keyboard' },
      { clue: 5, row: 2, col: 0, answer: 'SOLAR', text: 'Relating to the Sun — ___ system, ___ energy' },
      { clue: 6, row: 4, col: 0, answer: 'CODE',  text: 'Instructions for a computer, or a secret cipher' },
    ],
    down: [
      { clue: 1, row: 0, col: 0, answer: 'MUSIC', text: 'Art form combining rhythm, melody, and harmony' },
      { clue: 2, row: 0, col: 1, answer: 'ATOM',  text: 'Smallest unit of a chemical element' },
      { clue: 3, row: 0, col: 3, answer: 'SPACE', text: 'The vast expanse beyond Earth\'s atmosphere' },
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
