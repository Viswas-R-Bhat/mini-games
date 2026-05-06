import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Replace these with your actual Supabase project values ──────────────────
const SUPABASE_URL     = 'https://kfgmtyjvelbkjyxkawpo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__MiJwDYDQSHy7wbgcpKdng_0WAJoUCd';
// ────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
