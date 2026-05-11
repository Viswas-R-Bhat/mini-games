// One-time Node.js script to encode all answer values.
// Run: node tools/encode-answers.js

const _s = [86,97,114,65,73,110,99,101,50,48,50,54];

function enc(str) {
  const s = String(str);
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    bytes.push(s.charCodeAt(i) ^ _s[i % _s.length]);
  }
  return Buffer.from(bytes).toString('base64');
}

// === QUIZ ANSWERS ===
console.log('=== QUIZ ===');
const rounds = {
  1: [0,1,1,0,1,0,2,3,0,2,0,2,2,1,1],
  2: [1,0,2,0,2,2,1,0,1,1,1,1,1,0,2],
  3: [1,1,1,2,1,1,1,1,2,1,2,1,1,2,2],
};
for (const [r, answers] of Object.entries(rounds)) {
  console.log(`Round ${r}:`);
  answers.forEach((a, i) => console.log(`  [${i}] ${a} => '${enc(String(a))}'`));
}

// === CROSSWORD GRIDS ===
console.log('\n=== CROSSWORD GRIDS ===');
const grids = [
  [['M','A','R','S',0],['U','T','Y','P','E'],['S','O','L','A','R'],['I','M',0,'C',0],['C','O','D','E',0]],
  [['L','O','O','P',0],['O',0,0,0,0],['G',0,0,0,0],['I',0,0,0,0],['C','L','A','S','S']],
  [['H','E','I','S','E','N','B','U','G',0,0],['Y',0,0,'P',0,'O','I',0,'E',0,0],['P','I','D','E','M','P','O','T','E','N','T'],['E',0,0,'C',0,0,'S',0,'K',0,'H'],['R','E','C','U','R','S','I','O','N',0,'R'],['V',0,0,'L',0,0,'N',0,'O',0,'E'],['I',0,0,'A',0,0,'D',0,'D',0,'A'],['S',0,0,'T',0,0,'E',0,'E',0,'D'],['O',0,0,'I',0,0,'X',0,0,0,0],['R',0,0,'V',0,0,0,0,0,0,0],[0,0,0,'E',0,0,0,0,0,0,0]]
];
grids.forEach((grid, gi) => {
  console.log(`Grid ${gi}:`);
  grid.forEach((row, ri) => {
    const enc_row = row.map(c => c === 0 ? '0' : `'${enc(c)}'`);
    console.log(`  [${enc_row.join(', ')}],`);
  });
});

// === CROSSWORD CLUE ANSWERS ===
console.log('\n=== CROSSWORD CLUE ANSWERS ===');
const words = ['MARS','TYPE','SOLAR','CODE','MUSIC','ATOM','SPACE',
  'LOOP','CLASS','LOGIC',
  'HEISENBUG','IDEMPOTENT','RECURSION','HYPERVISOR','SPECULATIVE','NOP','BIOS','GEEK','THREAD','INDEX','NODE'];
words.forEach(w => console.log(`  ${w} => '${enc(w)}'`));

// === DEBUG ===
console.log('\n=== DEBUG ===');
const debugItems = [
  { bl: 2, fc: '    for i in range(len(lst)):' },
  { bl: 5, fc: '    return len;' },
  { bl: 0, fc: 'def add_item(item, lst=None):' },
  { bl: 3, fc: '    for (int i = 1; i < v.size(); i++) {' },
  { bl: 1, fc: '    a, b = b, a' },
  { bl: 7, fc: '            low = mid + 1' },
  { bl: 4, fc: '            result.extend(flatten(item))' },
  { bl: 2, fc: '    for (int i = 0; i < len / 2; i++) {' },
  { bl: 5, fc: '    n->next = *head; *head = n;' },
  { bl: 6, fc: '        cache[args] = result' },
  { bl: 2, fc: '    char *result = malloc(len + 1);' },
  { bl: 5, fc: '    return fibonacci(n - 1) + fibonacci(n - 2)' },
  { bl: 3, fc: '    std::weak_ptr<Node> prev;' },
  { bl: 4, fc: '    // remove this line \u2014 copy points to same memory as arr' },
  { bl: 7, fc: '    return primes' },
  { bl: 4, fc: '            it = v.erase(it); } else { ++it; }' },
];
debugItems.forEach((d, i) => {
  console.log(`  [${i}] _bl: '${enc(String(d.bl))}', _fc: '${enc(d.fc)}'`);
});

// === MEMORY PAIR IDS (encode pairId as string) ===
console.log('\n=== MEMORY ===');
for (let i = 1; i <= 10; i++) {
  console.log(`  pairId ${i} => '${enc(String(i))}'`);
}
