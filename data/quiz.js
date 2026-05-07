// /data/quiz.js — Questions organized by round.
// Round 1: General Knowledge (first-year friendly)
// Round 2: Basic CS concepts
// Round 3: CS concepts with hard questions

export const questionsByRound = {
  1: [
    { question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Central Program Utility', 'Computer Personal Unit', 'Central Processor Unified'], answer: 0 },
    { question: 'How many bits are in a byte?', options: ['4', '8', '16', '32'], answer: 1 },
    { question: 'Who is known as the father of computers?', options: ['Alan Turing', 'Charles Babbage', 'John von Neumann', 'Dennis Ritchie'], answer: 1 },
    { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], answer: 0 },
    { question: 'What is the binary representation of the decimal number 10?', options: ['1100', '1010', '1001', '1110'], answer: 1 },
    { question: 'What does USB stand for?', options: ['Universal Serial Bus', 'Unified System Bus', 'Universal System Bridge', 'Ultra Speed Bus'], answer: 0 },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], answer: 2 },
    { question: 'What is the unit of electric current?', options: ['Volt', 'Watt', 'Ohm', 'Ampere'], answer: 3 },
    { question: 'What does URL stand for?', options: ['Uniform Resource Locator', 'Universal Reference Link', 'Unified Resource Language', 'Universal Resource Locator'], answer: 0 },
    { question: 'Which programming language was created by James Gosling?', options: ['Python', 'C++', 'Java', 'JavaScript'], answer: 2 },
    { question: 'What does PDF stand for?', options: ['Portable Document Format', 'Printable Document File', 'Personal Data Format', 'Program Data File'], answer: 0 },
    { question: 'How many bytes are in a kilobyte (traditionally)?', options: ['100', '512', '1024', '1000'], answer: 2 },
    { question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2 },
    { question: 'Who invented the World Wide Web?', options: ['Vint Cerf', 'Tim Berners-Lee', 'Steve Jobs', 'Bill Gates'], answer: 1 },
    { question: 'What does LAN stand for?', options: ['Large Area Network', 'Local Area Network', 'Linked Access Node', 'Local Access Network'], answer: 1 },
  ],
  2: [
    { question: 'Which data structure uses FIFO ordering?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1 },
    { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'System Query Language', 'Standard Question Language'], answer: 0 },
    { question: 'What is the time complexity of linear search?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2 },
    { question: 'What does OOP stand for?', options: ['Object Oriented Programming', 'Open Operating Protocol', 'Ordered Object Processing', 'Output Oriented Programming'], answer: 0 },
    { question: 'Which keyword defines a function in Python?', options: ['function', 'func', 'def', 'define'], answer: 2 },
    { question: 'What is the default port number for HTTP?', options: ['21', '25', '80', '443'], answer: 2 },
    { question: 'Which data structure uses LIFO ordering?', options: ['Queue', 'Stack', 'Array', 'Linked List'], answer: 1 },
    { question: 'What does API stand for?', options: ['Application Programming Interface', 'Advanced Program Integration', 'Automated Process Interface', 'Application Process Integration'], answer: 0 },
    { question: 'What is the decimal value of binary 1010?', options: ['8', '10', '12', '14'], answer: 1 },
    { question: 'What does RAM stand for?', options: ['Read Access Memory', 'Random Access Memory', 'Rapid Action Memory', 'Random Allocated Memory'], answer: 1 },
    { question: 'Which of these is NOT a programming language?', options: ['Python', 'HTML', 'Java', 'C++'], answer: 1 },
    { question: 'What is the primary key in a database?', options: ['Any column', 'A column that uniquely identifies each row', 'The first column', 'An encrypted column'], answer: 1 },
    { question: 'Which symbol is used for single-line comments in Python?', options: ['//', '#', '--', '/*'], answer: 1 },
    { question: 'What does IDE stand for?', options: ['Integrated Development Environment', 'Internal Data Engine', 'Interactive Debug Engine', 'Internet Development Engine'], answer: 0 },
    { question: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort O(n²)', 'Selection Sort O(n²)', 'Merge Sort O(n log n)', 'Insertion Sort O(n²)'], answer: 2 },
  ],
  3: [
    { question: 'What is the worst-case time complexity of quicksort?', options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], answer: 1 },
    { question: 'Which data structure is used in BFS?', options: ['Stack', 'Queue', 'Priority Queue', 'Deque'], answer: 1 },
    { question: 'Dijkstra\'s algorithm fails with:', options: ['Cycles', 'Negative edge weights', '100+ nodes', 'Undirected edges'], answer: 1 },
    { question: 'Which scheduling algorithm can cause starvation?', options: ['Round Robin', 'FCFS', 'Shortest Job First', 'Lottery'], answer: 2 },
    { question: 'Banker\'s Algorithm prevents:', options: ['Buffer overflow', 'Deadlock', 'Race condition', 'Segfault'], answer: 1 },
    { question: 'In virtual memory, a TLB caches:', options: ['File descriptors', 'Page table entries', 'Process IDs', 'Semaphore values'], answer: 1 },
    { question: 'TCP three-way handshake sequence is:', options: ['ACK,SYN,FIN', 'SYN,SYN-ACK,ACK', 'SYN,ACK,RST', 'FIN,ACK,SYN'], answer: 1 },
    { question: 'In ACID, "Isolation" ensures:', options: ['Data saved to disk', 'Transactions appear serial', 'All or nothing', 'Valid data types'], answer: 1 },
    { question: 'Which normal form eliminates transitive dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 2 },
    { question: 'CAP theorem says a distributed system can guarantee at most:', options: ['All three C,A,P', 'Two of C,A,P', 'Only consistency', 'Only availability'], answer: 1 },
    { question: 'Space complexity of merge sort is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2 },
    { question: 'Two\'s complement of -1 in 8 bits is:', options: ['10000001', '11111111', '10000000', '01111111'], answer: 1 },
    { question: 'A /26 subnet gives how many usable hosts?', options: ['64', '62', '30', '126'], answer: 1 },
    { question: 'B+ tree stores data pointers at:', options: ['Root', 'Internal nodes', 'Leaf nodes', 'All nodes'], answer: 2 },
    { question: 'Pattern ensuring only one instance of a class:', options: ['Factory', 'Observer', 'Singleton', 'Strategy'], answer: 2 },
  ],
};

// Flatten all for backwards compatibility
export const questions = [
  ...questionsByRound[1].map(q => ({ ...q, round: 1, category: 'GK' })),
  ...questionsByRound[2].map(q => ({ ...q, round: 2, category: 'CS' })),
  ...questionsByRound[3].map(q => ({ ...q, round: 3, category: 'Hard' })),
];
