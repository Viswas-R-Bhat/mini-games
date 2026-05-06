import { supabase } from './supabaseClient.js';

// ── Inject modal styles once ─────────────────────────────────────────────────
function injectModalStyles() {
  if (document.getElementById('player-modal-style')) return;
  const style = document.createElement('style');
  style.id = 'player-modal-style';
  style.textContent = `
    #player-modal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(8,11,20,0.92);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
    }
    #player-modal {
      background: #0f1623;
      border: 1px solid #1e2d45;
      border-radius: 12px;
      padding: 2.5rem;
      width: min(420px, 92vw);
      box-shadow: 0 0 60px rgba(79,255,176,0.08), 0 24px 64px rgba(0,0,0,0.6);
    }
    #player-modal h2 {
      font-family: 'Bebas Neue', 'Impact', sans-serif;
      font-size: 2rem; letter-spacing: 0.08em;
      color: #4fffb0; margin: 0 0 0.25rem;
    }
    #player-modal p {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #6b7fa3; font-size: 0.85rem; margin: 0 0 1.75rem;
    }
    #player-modal label {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
      color: #4fffb0; margin-bottom: 0.4rem;
    }
    #player-modal input {
      width: 100%; box-sizing: border-box;
      background: #080b14; border: 1px solid #1e2d45;
      border-radius: 6px; padding: 0.65rem 0.85rem;
      color: #e8eaf0; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;
      outline: none; margin-bottom: 1.1rem;
      transition: border-color 0.2s;
    }
    #player-modal input:focus { border-color: #4fffb0; }
    #player-modal input::placeholder { color: #2a3a52; }
    #player-modal button {
      width: 100%; padding: 0.75rem;
      background: #4fffb0; color: #080b14;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.1rem; letter-spacing: 0.1em;
      border: none; border-radius: 6px; cursor: pointer;
      transition: opacity 0.15s, transform 0.15s;
    }
    #player-modal button:hover { opacity: 0.88; transform: translateY(-1px); }
    #player-modal .modal-error {
      color: #ff6b35; font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem; margin-bottom: 0.75rem; min-height: 1rem;
    }
  `;
  document.head.appendChild(style);
}

// ── initPlayer ───────────────────────────────────────────────────────────────
// Returns { usn, username } from localStorage or prompts the user.
export async function initPlayer() {
  const usn      = localStorage.getItem('usn');
  const username = localStorage.getItem('username');
  if (usn && username) return { usn, username };

  injectModalStyles();

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'player-modal-overlay';
    overlay.innerHTML = `
      <div id="player-modal">
        <h2>WELCOME</h2>
        <p>Enter your details to join the leaderboard. You'll only need to do this once.</p>
        <label for="pm-username">Username</label>
        <input id="pm-username" type="text" placeholder="e.g. Alice" autocomplete="off" />
        <label for="pm-usn">USN (University Seat Number)</label>
        <input id="pm-usn" type="text" placeholder="e.g. 1BM22CS001" autocomplete="off" />
        <div class="modal-error" id="pm-error"></div>
        <button id="pm-submit">LET'S GO →</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const usernameInput = overlay.querySelector('#pm-username');
    const usnInput      = overlay.querySelector('#pm-usn');
    const errorEl       = overlay.querySelector('#pm-error');
    const submitBtn     = overlay.querySelector('#pm-submit');

    usernameInput.focus();

    submitBtn.addEventListener('click', async () => {
      const newUsername = usernameInput.value.trim();
      const newUsn      = usnInput.value.trim().toUpperCase();

      if (!newUsername) { errorEl.textContent = 'Username is required.'; return; }
      if (!newUsn)      { errorEl.textContent = 'USN is required.';      return; }

      submitBtn.textContent = 'SAVING…';
      submitBtn.disabled    = true;
      errorEl.textContent   = '';

      const { error } = await supabase
        .from('players')
        .upsert({ usn: newUsn, username: newUsername }, { onConflict: 'usn', ignoreDuplicates: true });

      if (error) {
        errorEl.textContent   = 'Could not save. Check your connection.';
        submitBtn.textContent = "LET'S GO →";
        submitBtn.disabled    = false;
        return;
      }

      localStorage.setItem('usn',      newUsn);
      localStorage.setItem('username', newUsername);
      overlay.remove();
      resolve({ usn: newUsn, username: newUsername });
    });
  });
}

// ── submitScore ──────────────────────────────────────────────────────────────
// Always logs the attempt. Upserts best score into game_scores.
export async function submitScore({ usn, game, score, meta }) {
  // 1. Always insert into attempt_logs
  const { error: logError } = await supabase
    .from('attempt_logs')
    .insert({ usn, game, score, meta });

  if (logError) console.error('[submitScore] attempt_logs insert failed:', logError);

  // 2. Fetch current best score for this player+game
  const { data: existing } = await supabase
    .from('game_scores')
    .select('score')
    .eq('usn', usn)
    .eq('game', game)
    .maybeSingle();

  // 3. Only upsert if new score is strictly higher (or no record exists yet)
  if (!existing || score > existing.score) {
    const { error: upsertError } = await supabase
      .from('game_scores')
      .upsert(
        { usn, game, score, meta, updated_at: new Date().toISOString() },
        { onConflict: 'usn,game' }
      );
    if (upsertError) console.error('[submitScore] game_scores upsert failed:', upsertError);
  }
}
