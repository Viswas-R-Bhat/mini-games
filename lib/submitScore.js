import { supabase } from './supabaseClient.js';

// ── Inject modal styles once ─────────────────────────────────────────────────
function injectModalStyles() {
  if (document.getElementById('team-modal-style')) return;
  const style = document.createElement('style');
  style.id = 'team-modal-style';
  style.textContent = `
    #team-modal-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(4,6,11,0.95);
      backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
    }
    #team-modal {
      background: #0a0f1a;
      border: 1px solid #1a2438;
      border-radius: 12px;
      padding: 2.5rem;
      width: min(440px, 92vw);
      box-shadow: 0 0 80px rgba(79,255,176,0.1), 0 24px 64px rgba(0,0,0,0.6);
    }
    #team-modal h2 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.2rem; letter-spacing: 0.08em;
      color: #4fffb0; margin: 0 0 0.25rem;
    }
    #team-modal p {
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #6b7fa3; font-size: 0.85rem; margin: 0 0 1.75rem;
    }
    #team-modal label {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
      color: #4fffb0; margin-bottom: 0.4rem;
    }
    #team-modal select {
      width: 100%; box-sizing: border-box;
      background: #04060b; border: 1px solid #1a2438;
      border-radius: 6px; padding: 0.7rem 0.85rem;
      color: #f0f2f5; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;
      outline: none; margin-bottom: 1.2rem;
      transition: border-color 0.2s;
      cursor: pointer;
      appearance: none;
    }
    #team-modal select:focus { border-color: #4fffb0; }
    #team-modal button {
      width: 100%; padding: 0.8rem;
      background: #4fffb0; color: #04060b;
      font-family: 'Bebas Neue', sans-serif; font-size: 1.15rem; letter-spacing: 0.1em;
      border: none; border-radius: 6px; cursor: pointer;
      transition: opacity 0.15s, transform 0.15s;
    }
    #team-modal button:hover { opacity: 0.88; transform: translateY(-1px); }
    #team-modal button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    #team-modal .modal-error {
      color: #ff6b35; font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem; margin-bottom: 0.75rem; min-height: 1rem;
    }
    #team-modal .modal-loading {
      color: #6b7fa3; font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem; text-align: center; padding: 1rem;
    }
  `;
  document.head.appendChild(style);
}

// ── Helper: read/write localStorage safely ───────────────────────────────────
function lsGet(key, fallback = 0) {
  try { return parseInt(localStorage.getItem(key), 10) || fallback; }
  catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, String(val)); } catch { }
}
function lsGetJSON(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function lsSetJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
}

// ── initPlayer (team-based) ──────────────────────────────────────────────────
export async function initPlayer() {
  const team_name = localStorage.getItem('team_name');
  if (team_name) return { team_name, usn: team_name, username: team_name };

  injectModalStyles();

  return new Promise(async (resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'team-modal-overlay';
    overlay.innerHTML = `
      <div id="team-modal">
        <h2>TEAM LOGIN</h2>
        <p>Select your team to begin. Your progress is saved automatically.</p>
        <label for="tm-team">Your Team</label>
        <div class="modal-loading" id="tm-loading">Loading teams…</div>
        <select id="tm-team" style="display:none">
          <option value="">— Select your team —</option>
        </select>
        <div class="modal-error" id="tm-error"></div>
        <button id="tm-submit" disabled>JOIN →</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const selectEl = overlay.querySelector('#tm-team');
    const loadingEl = overlay.querySelector('#tm-loading');
    const errorEl = overlay.querySelector('#tm-error');
    const submitBtn = overlay.querySelector('#tm-submit');

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('team_name')
        .order('team_name', { ascending: true });

      loadingEl.style.display = 'none';
      selectEl.style.display = 'block';

      if (error) throw error;
      if (!data || data.length === 0) {
        errorEl.textContent = 'No teams registered yet. Contact admin.';
        return;
      }

      data.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.team_name;
        opt.textContent = t.team_name;
        selectEl.appendChild(opt);
      });
    } catch (err) {
      loadingEl.style.display = 'none';
      errorEl.textContent = 'Failed to load teams. Check connection.';
      console.error('[initPlayer] teams fetch error:', err);
      return;
    }

    selectEl.addEventListener('change', () => {
      submitBtn.disabled = !selectEl.value;
    });

    submitBtn.addEventListener('click', () => {
      const chosen = selectEl.value;
      if (!chosen) { errorEl.textContent = 'Please select a team.'; return; }

      localStorage.setItem('team_name', chosen);
      overlay.remove();
      resolve({ team_name: chosen, usn: chosen, username: chosen });
    });
  });
}

// ── getAttemptInfo ────────────────────────────────────────────────────────────
// Returns { used, allowed } for a given team + game.
// Uses localStorage as primary source; Supabase only updates upward.
export async function getAttemptInfo(team_name, game, baseAttempts) {
  const cacheKey = `attempts_${team_name}_${game}`;
  const localUsed = lsGet(`game_attempts_${team_name}_${game}`, 0);

  let supaUsed = 0;
  let extra = 0;

  try {
    const { count, error } = await supabase
      .from('attempt_logs')
      .select('*', { count: 'exact', head: true })
      .eq('team_name', team_name)
      .eq('game', game);

    if (!error && count != null) supaUsed = count;
  } catch (e) {
    console.warn(`[getAttemptInfo] Supabase count failed for ${game}:`, e);
  }

  try {
    const { data: extraData } = await supabase
      .from('extra_attempts')
      .select('extra')
      .eq('team_name', team_name)
      .eq('game', game)
      .maybeSingle();
    extra = extraData?.extra || 0;
  } catch (e) {
    console.warn(`[getAttemptInfo] extra_attempts query failed for ${game}`);
  }

  // Use whichever is HIGHER — never let Supabase reset local progress
  const used = Math.max(localUsed, supaUsed);
  const allowed = baseAttempts + extra;

  // Update localStorage to the highest known value
  lsSet(`game_attempts_${team_name}_${game}`, used);
  lsSetJSON(cacheKey, { used, allowed, remaining: Math.max(0, allowed - used) });

  return { used, allowed, remaining: Math.max(0, allowed - used) };
}

// ── getGameAttemptCount (for sequential unlock checking) ─────────────────────
// CRITICAL: localStorage is primary. Supabase can only increase the count.
export async function getGameAttemptCount(team_name, game) {
  const lsKey = `game_attempts_${team_name}_${game}`;
  const localCount = lsGet(lsKey, 0);

  let supaCount = 0;
  try {
    const { count, error } = await supabase
      .from('attempt_logs')
      .select('*', { count: 'exact', head: true })
      .eq('team_name', team_name)
      .eq('game', game);

    if (!error && count != null) supaCount = count;
  } catch (e) {
    console.warn(`[getGameAttemptCount] Supabase failed for ${game}, using localStorage`);
  }

  // Use whichever is HIGHER — never go backwards
  const best = Math.max(localCount, supaCount);
  lsSet(lsKey, best);
  return best;
}

// ── submitScore ──────────────────────────────────────────────────────────────
export async function submitScore({ usn, game, score, meta }) {
  const team_name = usn;

  // ── STEP 1: localStorage first (instant, always works) ──────────────
  const attKey = `game_attempts_${team_name}_${game}`;
  const newCount = lsGet(attKey, 0) + 1;
  lsSet(attKey, newCount);

  const scoreKey = `score_${team_name}_${game}`;
  const cached = lsGetJSON(scoreKey, { best: 0, attempts: 0 });
  cached.best = Math.max(cached.best, score);
  cached.attempts = newCount;
  cached.lastMeta = meta;
  lsSetJSON(scoreKey, cached);

  console.log(`[submitScore] ${game}: localStorage OK — attempts=${newCount}, best=${cached.best}`);

  // ── STEP 2: Single atomic RPC (replaces the two separate writes) ─────
  // One DB transaction: attempt_logs INSERT + game_scores GREATEST upsert.
  // No SELECT, no race condition, no partial failure.
  try {
    const { error } = await supabase.rpc('submit_score_atomic', {
      p_team_name: team_name,
      p_game: game,
      p_score: score,
      p_meta: meta ?? {},
    });

    if (error) {
      console.error('[submitScore] RPC failed:', error);
    } else {
      console.log(`[submitScore] ${game}: Supabase RPC OK`);
    }
  } catch (e) {
    console.error('[submitScore] RPC exception:', e);
  }
}

// ── checkLeaderboardVisible ──────────────────────────────────────────────────
export async function checkLeaderboardVisible() {
  try {
    const { data } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'show_leaderboard')
      .maybeSingle();
    return data?.value === 'true';
  } catch (e) {
    return false;
  }
}
