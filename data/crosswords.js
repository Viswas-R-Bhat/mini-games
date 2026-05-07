// /data/crosswords.js
// DATA ONLY — no logic, no DOM, no imports.
// Engine picks a puzzle randomly; every entry here must pass validateCrossword().
//
// Grid: 0 = black cell | 'LETTER' = white cell (uppercase single char)
// Clue numbers follow standard crossword order: left→right, top→bottom.

export const crosswords = [
  {
    id: 'cs-basics-1',
    title: 'CS Basics',

    // 6 rows × 7 cols
    gridSize: { rows: 6, cols: 7 },

    //         col:  0     1     2     3     4     5     6
    grid: [
      /* row 0 */ [  0,  'S', 'T', 'A', 'C', 'K',   0  ],
      /* row 1 */ [  0,   0,   0,   0,   0,  'E',   0  ],
      /* row 2 */ [  0,   0,   0,   0,   0,  'R',   0  ],
      /* row 3 */ ['P', 'Y', 'T', 'H', 'O', 'N',   0  ],
      /* row 4 */ [  0,  'C', 'A', 'C', 'H', 'E',   0  ],
      /* row 5 */ [  0,   0,   0,   0,   0,  'L',   0  ],
    ],

    // Intersections verified:
    //   STACK[4]  = K  @ (0,5)  =  KERNEL[0] = K  ✓
    //   PYTHON[5] = N  @ (3,5)  =  KERNEL[3] = N  ✓
    //   CACHE[4]  = E  @ (4,5)  =  KERNEL[4] = E  ✓

    across: [
      { clue: 1, row: 0, col: 1, answer: 'STACK',  text: 'Last in, first out data structure'             },
      { clue: 3, row: 3, col: 0, answer: 'PYTHON', text: 'Popular high-level programming language'       },
      { clue: 4, row: 4, col: 1, answer: 'CACHE',  text: 'Fast memory that stores frequently used data'  },
    ],
    down: [
      { clue: 2, row: 0, col: 5, answer: 'KERNEL', text: 'Core of an operating system'                  },
    ],
  },
];

// ─── HOW TO ADD A NEW PUZZLE ──────────────────────────────────────────────────
// 1. Push a new object into the array above.
// 2. Choose gridSize, lay out grid letters, fill across[] and down[].
// 3. Manually verify every intersection: across_word[i] === down_word[j]
//    at the shared cell.
// 4. The engine's validateCrossword() will catch any remaining errors at runtime.
// 5. DO NOT touch the engine (games/crossword.js) when adding puzzles.
