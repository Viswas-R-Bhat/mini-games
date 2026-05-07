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

// ── initPlayer (now team-based) ──────────────────────────────────────────────
// Returns { team_name } from localStorage or prompts with a dropdown.
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

    const selectEl  = overlay.querySelector('#tm-team');
    const loadingEl = overlay.querySelector('#tm-loading');
    const errorEl   = overlay.querySelector('#tm-error');
    const submitBtn = overlay.querySelector('#tm-submit');

    // Fetch teams from Supabase
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
// Returns { used, allowed } for a given team + game
export async function getAttemptInfo(team_name, game, baseAttempts) {
  // Count used attempts
  const { count } = await supabase
    .from('attempt_logs')
    .select('*', { count: 'exact', head: true })
    .eq('team_name', team_name)
    .eq('game', game);

  // Check for extra attempts granted by admin
  const { data: extraData } = await supabase
    .from('extra_attempts')
    .select('extra')
    .eq('team_name', team_name)
    .eq('game', game)
    .maybeSingle();

  const extra = extraData?.extra || 0;
  const allowed = baseAttempts + extra;
  const used = count || 0;

  return { used, allowed, remaining: Math.max(0, allowed - used) };
}

// ── submitScore ──────────────────────────────────────────────────────────────
// Logs attempt and upserts best score. Now uses team_name instead of usn.
export async function submitScore({ usn, game, score, meta }) {
  const team_name = usn; // usn is now team_name for backwards compat

  // 1. Insert into attempt_logs
  const { error: logError } = await supabase
    .from('attempt_logs')
    .insert({ team_name, game, score, meta });

  if (logError) console.error('[submitScore] attempt_logs insert failed:', logError);

  // 2. Fetch current best score for this team+game
  const { data: existing } = await supabase
    .from('game_scores')
    .select('score')
    .eq('team_name', team_name)
    .eq('game', game)
    .maybeSingle();

  // 3. Only upsert if new score is strictly higher (or no record exists yet)
  if (!existing || score > existing.score) {
    const { error: upsertError } = await supabase
      .from('game_scores')
      .upsert(
        { team_name, game, score, meta, updated_at: new Date().toISOString() },
        { onConflict: 'team_name,game' }
      );
    if (upsertError) console.error('[submitScore] game_scores upsert failed:', upsertError);
  }
}

// ── checkLeaderboardVisible ──────────────────────────────────────────────────
// Check if admin has toggled leaderboard visibility
export async function checkLeaderboardVisible() {
  const { data } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', 'show_leaderboard')
    .maybeSingle();

  return data?.value === 'true';
}
