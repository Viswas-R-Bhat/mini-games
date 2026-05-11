import { supabase } from './supabaseClient.js';

// ── loadLeaderboard ──────────────────────────────────────────────────────────
// Fetches the top scores for a given game, joined with player usernames.
// Returns an array sorted by score descending:
//   [{ rank, usn, username, score, meta, updated_at }, …]
export async function loadLeaderboard(game, limit = 50) {
  const { data, error } = await supabase
    .from('game_scores')
    .select('usn, score, meta, updated_at')
    .eq('game', game)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[loadLeaderboard] fetch failed:', error);
    return [];
  }

  return (data || []).map((row, i) => ({
    rank:       i + 1,
    usn:        row.usn,
    username:   row.usn,
    score:      row.score,
    meta:       row.meta,
    updated_at: row.updated_at,
  }));
}
