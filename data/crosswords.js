export const crosswords = [
  {
    id: "tech-10x10-2",
    gridSize: 10,
    grid: [
      ["", "", "", "#", "", "", "", "", "#", ""],
      ["", "#", "", "#", "", "#", "#", "", "#", ""],
      ["", "#", "", "", "", "", "#", "", "", ""],
      ["", "#", "#", "#", "#", "", "#", "#", "#", ""],
      ["", "", "", "", "#", "", "", "", "#", ""],
      ["#", "#", "#", "", "#", "#", "#", "", "#", ""],
      ["", "", "", "", "#", "", "", "", "", ""],
      ["", "#", "#", "#", "#", "", "#", "#", "#", ""],
      ["", "#", "", "", "", "", "#", "", "", ""],
      ["", "", "", "#", "", "", "", "", "#", ""]
    ],
    clues: {
      across: [
        { number: 1,  row: 0, col: 0, answer: "ARRAY", clue: "Indexed collection" },
        { number: 4,  row: 0, col: 4, answer: "STACK", clue: "LIFO structure" },
        { number: 7,  row: 2, col: 2, answer: "QUEUE", clue: "FIFO structure" },
        { number: 9,  row: 4, col: 0, answer: "GRAPH", clue: "Nodes and edges" },
        { number: 11, row: 4, col: 5, answer: "TREE",  clue: "Hierarchical structure" },
        { number: 13, row: 6, col: 0, answer: "CLASS", clue: "Blueprint of objects" },
        { number: 15, row: 6, col: 5, answer: "LOGIC", clue: "Basis of reasoning" },
        { number: 17, row: 8, col: 2, answer: "LOOPS", clue: "Used for iteration" },
        { number: 19, row: 9, col: 0, answer: "CODE",  clue: "What programmers write" },
        { number: 20, row: 9, col: 4, answer: "DEBUG", clue: "Remove errors" }
      ],
      down: [
        { number: 2,  row: 0, col: 0, answer: "ALGO",     clue: "Step-by-step procedure" },
        { number: 3,  row: 0, col: 2, answer: "RUNTIMES", clue: "Program execution moments" },
        { number: 5,  row: 0, col: 5, answer: "CACHE",    clue: "Fast temporary storage" },
        { number: 6,  row: 0, col: 7, answer: "KEY",      clue: "Used in maps" },
        { number: 8,  row: 2, col: 9, answer: "NODE",     clue: "Graph element" },
        { number: 10, row: 4, col: 3, answer: "HASH",     clue: "Used in hashmaps" },
        { number: 12, row: 6, col: 1, answer: "OOP",      clue: "Programming paradigm" },
        { number: 14, row: 6, col: 6, answer: "IF",       clue: "Conditional keyword" },
        { number: 16, row: 8, col: 7, answer: "API",      clue: "Interface for software" },
        { number: 18, row: 8, col: 9, answer: "IO",       clue: "Input and Output" }
      ]
    }
  }
];
