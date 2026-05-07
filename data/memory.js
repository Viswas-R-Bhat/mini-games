// /data/memory.js — Card sets for 3 difficulty levels.
// Easy: 3x4 grid (6 pairs), Medium: 4x4 grid (8 pairs), Hard: 5x4 grid (10 pairs)

export const levels = {
  easy: {
    cols: 3, rows: 4, totalPairs: 6,
    sets: [
      {
        id: 'basics', title: 'CS Basics',
        pairs: [
          { id: 1, a: 'CPU', b: 'Processor' },
          { id: 2, a: 'RAM', b: 'Volatile' },
          { id: 3, a: 'ROM', b: 'Non-Volatile' },
          { id: 4, a: 'SSD', b: 'Fast Storage' },
          { id: 5, a: 'GPU', b: 'Graphics' },
          { id: 6, a: 'NIC', b: 'Network' },
        ],
      },
    ],
  },
  medium: {
    cols: 4, rows: 4, totalPairs: 8,
    sets: [
      {
        id: 'complexity', title: 'Algorithm Complexity',
        pairs: [
          { id: 1, a: 'Binary Search', b: 'O(log n)' },
          { id: 2, a: 'Merge Sort', b: 'O(n log n)' },
          { id: 3, a: 'Linear Search', b: 'O(n)' },
          { id: 4, a: 'Bubble Sort', b: 'O(n²)' },
          { id: 5, a: 'Hash Lookup', b: 'O(1)' },
          { id: 6, a: 'DFS / BFS', b: 'O(V + E)' },
          { id: 7, a: 'Heap Insert', b: 'O(log n)' },
          { id: 8, a: 'Matrix Multiply', b: 'O(n³)' },
        ],
      },
    ],
  },
  hard: {
    cols: 5, rows: 4, totalPairs: 10,
    sets: [
      {
        id: 'protocols', title: 'Networking Protocols',
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
        id: 'os-concepts', title: 'OS Concepts',
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
    ],
  },
};
