// /data/memory.js
// DATA ONLY — card theme sets for Memory Match.
// Each set has exactly 10 pairs for a 5×4 grid.
// Engine picks one set randomly.

export const cardSets = [
  {
    id: 'protocols',
    title: 'Networking Protocols',
    pairs: [
      { id: 1,  a: 'TCP',       b: 'Reliable' },
      { id: 2,  a: 'UDP',       b: 'Fast' },
      { id: 3,  a: 'HTTP',      b: 'Port 80' },
      { id: 4,  a: 'DNS',       b: 'Name → IP' },
      { id: 5,  a: 'FTP',       b: 'File Transfer' },
      { id: 6,  a: 'SSH',       b: 'Port 22' },
      { id: 7,  a: 'SMTP',      b: 'Send Mail' },
      { id: 8,  a: 'DHCP',      b: 'Auto IP' },
      { id: 9,  a: 'ARP',       b: 'MAC Lookup' },
      { id: 10, a: 'ICMP',      b: 'Ping' },
    ],
  },
  {
    id: 'complexity',
    title: 'Algorithm Complexity',
    pairs: [
      { id: 1,  a: 'Binary Search',   b: 'O(log n)' },
      { id: 2,  a: 'Merge Sort',      b: 'O(n log n)' },
      { id: 3,  a: 'Linear Search',   b: 'O(n)' },
      { id: 4,  a: 'Bubble Sort',     b: 'O(n²)' },
      { id: 5,  a: 'Hash Lookup',     b: 'O(1)' },
      { id: 6,  a: 'DFS / BFS',       b: 'O(V + E)' },
      { id: 7,  a: 'Heap Insert',     b: 'O(log n)' },
      { id: 8,  a: 'Matrix Multiply', b: 'O(n³)' },
      { id: 9,  a: 'Counting Sort',   b: 'O(n + k)' },
      { id: 10, a: 'Fibonacci Naive',  b: 'O(2ⁿ)' },
    ],
  },
  {
    id: 'os-concepts',
    title: 'OS Concepts',
    pairs: [
      { id: 1,  a: 'Mutex',          b: 'Exclusive Lock' },
      { id: 2,  a: 'Semaphore',      b: 'Counting Lock' },
      { id: 3,  a: 'Deadlock',       b: 'Circular Wait' },
      { id: 4,  a: 'Thrashing',      b: 'Excess Paging' },
      { id: 5,  a: 'Context Switch', b: 'Save/Restore' },
      { id: 6,  a: 'Page Fault',     b: 'Disk Fetch' },
      { id: 7,  a: 'Fork()',         b: 'Clone Process' },
      { id: 8,  a: 'Inode',          b: 'File Metadata' },
      { id: 9,  a: 'Kernel Mode',    b: 'Ring 0' },
      { id: 10, a: 'Scheduler',      b: 'CPU Allocator' },
    ],
  },
];
