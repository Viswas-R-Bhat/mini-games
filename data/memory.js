// /data/memory.js — Card sets for 3 difficulty levels (rounds).
// Round 1 (Easy): General Knowledge — first-year friendly
// Round 2 (Medium): Basic CS concepts
// Round 3 (Hard): Advanced CS concepts

export const levels = {
  easy: {
    cols: 3, rows: 4, totalPairs: 6,
    sets: [
      {
        id: 'gk-science', title: 'Science & Tech Basics',
        pairs: [
          { id: 1, a: 'H₂O',       b: 'Water' },
          { id: 2, a: 'Einstein',   b: 'Relativity' },
          { id: 3, a: 'Newton',     b: 'Gravity' },
          { id: 4, a: 'Google',     b: 'Search Engine' },
          { id: 5, a: 'Mars',       b: 'Red Planet' },
          { id: 6, a: 'DNA',        b: 'Genetic Code' },
        ],
      },
      {
        id: 'gk-inventors', title: 'Famous Inventors',
        pairs: [
          { id: 1, a: 'Edison',       b: 'Light Bulb' },
          { id: 2, a: 'Tesla',        b: 'AC Current' },
          { id: 3, a: 'Bell',         b: 'Telephone' },
          { id: 4, a: 'Wright Bros',  b: 'Airplane' },
          { id: 5, a: 'Turing',       b: 'Computing' },
          { id: 6, a: 'Tim B-Lee',    b: 'World Wide Web' },
        ],
      },
    ],
  },
  medium: {
    cols: 4, rows: 4, totalPairs: 8,
    sets: [
      {
        id: 'cs-basics', title: 'Programming Basics',
        pairs: [
          { id: 1, a: 'Variable',  b: 'Stores Data' },
          { id: 2, a: 'Loop',      b: 'Repetition' },
          { id: 3, a: 'Array',     b: 'Index-Based' },
          { id: 4, a: 'Function',  b: 'Reusable Code' },
          { id: 5, a: 'Boolean',   b: 'True / False' },
          { id: 6, a: 'String',    b: 'Text Data' },
          { id: 7, a: 'Integer',   b: 'Whole Number' },
          { id: 8, a: 'If-Else',   b: 'Condition' },
        ],
      },
      {
        id: 'cs-structures', title: 'Data Structures',
        pairs: [
          { id: 1, a: 'Stack',         b: 'LIFO' },
          { id: 2, a: 'Queue',         b: 'FIFO' },
          { id: 3, a: 'Linked List',   b: 'Nodes & Pointers' },
          { id: 4, a: 'Tree',          b: 'Hierarchical' },
          { id: 5, a: 'Hash Table',    b: 'Key → Value' },
          { id: 6, a: 'Graph',         b: 'Nodes & Edges' },
          { id: 7, a: 'Heap',          b: 'Priority' },
          { id: 8, a: 'Set',           b: 'Unique Items' },
        ],
      },
    ],
  },
  hard: {
    cols: 5, rows: 4, totalPairs: 10,
    sets: [
      {
        id: 'advanced-cs', title: 'Advanced Concepts',
        pairs: [
          { id: 1,  a: 'Mutex',          b: 'Exclusive Lock' },
          { id: 2,  a: 'Semaphore',      b: 'Counting Lock' },
          { id: 3,  a: 'Deadlock',       b: 'Circular Wait' },
          { id: 4,  a: 'Thrashing',      b: 'Excess Paging' },
          { id: 5,  a: 'Context Switch', b: 'Save/Restore' },
          { id: 6,  a: 'Page Fault',     b: 'Disk Fetch' },
          { id: 7,  a: 'TCP',            b: 'Reliable' },
          { id: 8,  a: 'UDP',            b: 'Fast / Lossy' },
          { id: 9,  a: 'DNS',            b: 'Name → IP' },
          { id: 10, a: 'ARP',            b: 'MAC Lookup' },
        ],
      },
      {
        id: 'algo-complexity', title: 'Algorithm Complexity',
        pairs: [
          { id: 1,  a: 'Binary Search',   b: 'O(log n)' },
          { id: 2,  a: 'Merge Sort',      b: 'O(n log n)' },
          { id: 3,  a: 'Linear Search',   b: 'O(n)' },
          { id: 4,  a: 'Bubble Sort',     b: 'O(n²)' },
          { id: 5,  a: 'Hash Lookup',     b: 'O(1)' },
          { id: 6,  a: 'DFS / BFS',       b: 'O(V + E)' },
          { id: 7,  a: 'Dijkstra',        b: 'Shortest Path' },
          { id: 8,  a: 'B+ Tree Search',  b: 'O(log n)' },
          { id: 9,  a: 'Quicksort Worst', b: 'O(n²)' },
          { id: 10, a: 'Matrix Multiply', b: 'O(n³)' },
        ],
      },
    ],
  },
};
