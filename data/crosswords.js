export const crosswords = [
  {
    id: 'cs-basics-1',
    title: 'CS Basics',
    gridSize: { rows: 6, cols: 7 },
    grid: [
      [  0,  'S', 'T', 'A', 'C', 'K',   0  ],
      [  0,   0,   0,   0,   0, 'E',   0  ],
      [  0,   0,   0,   0,   0, 'R',   0  ],
      ['P', 'Y', 'T', 'H', 'O', 'N',   0  ],
      [  0,  'C', 'A', 'C', 'H', 'E',   0  ],
      [  0,   0,   0,   0,   0, 'L',   0  ],
    ],
    across: [
      { clue: 1, row: 0, col: 1, answer: 'STACK',  text: 'Last in, first out data structure' },
      { clue: 3, row: 3, col: 0, answer: 'PYTHON', text: 'Popular high-level programming language' },
      { clue: 4, row: 4, col: 1, answer: 'CACHE',  text: 'Fast memory that stores frequently used data' },
    ],
    down: [
      { clue: 2, row: 0, col: 5, answer: 'KERNEL', text: 'Core of an operating system' },
    ],
  }, // <--- THIS COMMA IS CRITICAL
  {
    id: 'cs-advanced-tier-1',
    title: 'CS Engineering Tier',
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
      { clue: 1, row: 0, col: 0, answer: 'HEISENBUG',  text: 'A software anomaly that disappears or alters its behavior when one attempts to probe it.' },
      { clue: 6, row: 2, col: 1, answer: 'IDEMPOTENT', text: 'Property where an operation has the same effect whether executed once or multiple times.' },
      { clue: 8, row: 4, col: 0, answer: 'RECURSION',  text: 'To understand this, you must first understand this.' },
    ],
    down: [
      { clue: 1, row: 0, col: 0, answer: 'HYPERVISOR', text: 'Software that creates and runs virtual machines by isolating OS from hardware.' },
      { clue: 2, row: 0, col: 3, answer: 'SPECULATIVE', text: 'Execution technique where a system performs tasks that may not be needed to reduce latency.' },
      { clue: 3, row: 0, col: 5, answer: 'NOP',         text: 'The assembly instruction that performs no action other than incrementing the program counter.' },
      { clue: 4, row: 0, col: 6, answer: 'BIOS',        text: 'Legacy firmware used to perform hardware initialization during the booting process.' },
      { clue: 5, row: 0, col: 8, answer: 'GEEK',        text: 'A slang term for a person with an intense interest in computing or technology.' },
      { clue: 7, row: 2, col: 10, answer: 'THREAD',     text: 'The smallest sequence of programmed instructions that can be managed independently by a scheduler.' },
      { clue: 9, row: 4, col: 6, answer: 'INDEX',       text: 'A database structure used to improve data retrieval speed at the cost of additional storage.' },
      { clue: 10, row: 4, col: 8, answer: 'NODE',       text: 'A fundamental unit of a data structure, such as a linked list or tree.' },
    ],
  },
];
