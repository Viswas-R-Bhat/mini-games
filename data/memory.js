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
        id: 'robots', title: 'Robots (Pictures)',
        pairs: [
          { _p: 'Zw==',  a: '<img src="../data/images/bottts_1.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_1.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'ZA==',  a: '<img src="../data/images/bottts_2.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_2.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'ZQ==',  a: '<img src="../data/images/bottts_3.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_3.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'Yg==',  a: '<img src="../data/images/bottts_4.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_4.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'Yw==',  a: '<img src="../data/images/bottts_5.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_5.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'YA==',  a: '<img src="../data/images/bottts_6.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_6.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'YQ==',  a: '<img src="../data/images/bottts_7.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_7.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'bg==',  a: '<img src="../data/images/bottts_8.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_8.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'bw==',  a: '<img src="../data/images/bottts_9.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_9.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'Z1E=', a: '<img src="../data/images/bottts_10.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/bottts_10.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
        ],
      },
      {
        id: 'adventurers', title: 'Adventurers (Pictures)',
        pairs: [
          { _p: 'Zw==',  a: '<img src="../data/images/adventurer_1.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_1.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'ZA==',  a: '<img src="../data/images/adventurer_2.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_2.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'ZQ==',  a: '<img src="../data/images/adventurer_3.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_3.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'Yg==',  a: '<img src="../data/images/adventurer_4.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_4.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'Yw==',  a: '<img src="../data/images/adventurer_5.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_5.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'YA==',  a: '<img src="../data/images/adventurer_6.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_6.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'YQ==',  a: '<img src="../data/images/adventurer_7.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_7.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'bg==',  a: '<img src="../data/images/adventurer_8.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_8.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'bw==',  a: '<img src="../data/images/adventurer_9.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_9.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
          { _p: 'Z1E=', a: '<img src="../data/images/adventurer_10.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />', b: '<img src="../data/images/adventurer_10.svg" style="width:100%; height:100%; object-fit:contain; border-radius: 4px;" />' },
        ],
      },
    ],
  },
};
