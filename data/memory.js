// /data/memory.js — Card sets for 3 difficulty levels (rounds).
// Round 1 (Easy): General Knowledge — first-year friendly
// Round 2 (Medium): Basic CS concepts
// Round 3 (Hard): Advanced CS concepts
// Card text is encoded to prevent peeking via DevTools Elements tab.
// pairId is encoded to prevent matching via source inspection.

export const levels = {
  easy: {
    cols: 3, rows: 4, totalPairs: 6,
    sets: [
      {
        id: 'gk-science', title: 'Science & Tech Basics',
        pairs: [
          { _p: 'Zw==', a: 'H₂O',       b: 'Water' },
          { _p: 'ZA==', a: 'Einstein',   b: 'Relativity' },
          { _p: 'ZQ==', a: 'Newton',     b: 'Gravity' },
          { _p: 'Yg==', a: 'Google',     b: 'Search Engine' },
          { _p: 'Yw==', a: 'Mars',       b: 'Red Planet' },
          { _p: 'YA==', a: 'DNA',        b: 'Genetic Code' },
        ],
      },
      {
        id: 'gk-inventors', title: 'Famous Inventors',
        pairs: [
          { _p: 'Zw==', a: 'Edison',       b: 'Light Bulb' },
          { _p: 'ZA==', a: 'Tesla',        b: 'AC Current' },
          { _p: 'ZQ==', a: 'Bell',         b: 'Telephone' },
          { _p: 'Yg==', a: 'Wright Bros',  b: 'Airplane' },
          { _p: 'Yw==', a: 'Turing',       b: 'Computing' },
          { _p: 'YA==', a: 'Tim B-Lee',    b: 'World Wide Web' },
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
          { _p: 'Zw==', a: 'Variable',  b: 'Stores Data' },
          { _p: 'ZA==', a: 'Loop',      b: 'Repetition' },
          { _p: 'ZQ==', a: 'Array',     b: 'Index-Based' },
          { _p: 'Yg==', a: 'Function',  b: 'Reusable Code' },
          { _p: 'Yw==', a: 'Boolean',   b: 'True / False' },
          { _p: 'YA==', a: 'String',    b: 'Text Data' },
          { _p: 'YQ==', a: 'Integer',   b: 'Whole Number' },
          { _p: 'bg==', a: 'If-Else',   b: 'Condition' },
        ],
      },
      {
        id: 'cs-structures', title: 'Data Structures',
        pairs: [
          { _p: 'Zw==', a: 'Stack',         b: 'LIFO' },
          { _p: 'ZA==', a: 'Queue',         b: 'FIFO' },
          { _p: 'ZQ==', a: 'Linked List',   b: 'Nodes & Pointers' },
          { _p: 'Yg==', a: 'Tree',          b: 'Hierarchical' },
          { _p: 'Yw==', a: 'Hash Table',    b: 'Key → Value' },
          { _p: 'YA==', a: 'Graph',         b: 'Nodes & Edges' },
          { _p: 'YQ==', a: 'Heap',          b: 'Priority' },
          { _p: 'bg==', a: 'Set',           b: 'Unique Items' },
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
          { _p: 'Zw==',  a: 'Mutex',          b: 'Exclusive Lock' },
          { _p: 'ZA==',  a: 'Semaphore',      b: 'Counting Lock' },
          { _p: 'ZQ==',  a: 'Deadlock',       b: 'Circular Wait' },
          { _p: 'Yg==',  a: 'Thrashing',      b: 'Excess Paging' },
          { _p: 'Yw==',  a: 'Context Switch', b: 'Save/Restore' },
          { _p: 'YA==',  a: 'Page Fault',     b: 'Disk Fetch' },
          { _p: 'YQ==',  a: 'TCP',            b: 'Reliable' },
          { _p: 'bg==',  a: 'UDP',            b: 'Fast / Lossy' },
          { _p: 'bw==',  a: 'DNS',            b: 'Name → IP' },
          { _p: 'Z1E=', a: 'ARP',            b: 'MAC Lookup' },
        ],
      },
      {
        id: 'algo-complexity', title: 'Algorithm Complexity',
        pairs: [
          { _p: 'Zw==',  a: 'Binary Search',   b: 'O(log n)' },
          { _p: 'ZA==',  a: 'Merge Sort',      b: 'O(n log n)' },
          { _p: 'ZQ==',  a: 'Linear Search',   b: 'O(n)' },
          { _p: 'Yg==',  a: 'Bubble Sort',     b: 'O(n²)' },
          { _p: 'Yw==',  a: 'Hash Lookup',     b: 'O(1)' },
          { _p: 'YA==',  a: 'DFS / BFS',       b: 'O(V + E)' },
          { _p: 'YQ==',  a: 'Dijkstra',        b: 'Shortest Path' },
          { _p: 'bg==',  a: 'B+ Tree Search',  b: 'O(log n)' },
          { _p: 'bw==',  a: 'Quicksort Worst', b: 'O(n²)' },
          { _p: 'Z1E=', a: 'Matrix Multiply', b: 'O(n³)' },
        ],
      },
    ],
  },
};
