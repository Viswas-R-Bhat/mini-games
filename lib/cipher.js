// lib/cipher.js — Lightweight XOR cipher for answer obfuscation.
// Prevents casual inspection of answers in DevTools Sources/Network tab.
const _s = [86,97,114,65,73,110,99,101,50,48,50,54];

export function _d(e) {
  try {
    const b = atob(e);
    return Array.from(b).map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ _s[i % _s.length])
    ).join('');
  } catch { return ''; }
}

export function _n(e) {
  return parseInt(_d(e), 10);
}
