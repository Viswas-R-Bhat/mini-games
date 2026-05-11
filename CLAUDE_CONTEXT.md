# ReAIvive — The AI Resurrection Challenge

## Project Overview
A tech-fest mini-game platform for BMSCE VarAInce, featuring competitive challenges with team-based login, admin moderation, and a live leaderboard system.

## Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ESM)
- **Backend/Database**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel (static)

## Architecture
```
/index.html          → Landing page (ReAIvive branding, Admin/Participant buttons)
/games_list.html     → Participant game list (team login, game cards, leaderboard banner)
/api/admin-login.js  → Vercel serverless function for admin auth (reads env vars)
/pages/admin.html    → Admin dashboard (login, team mgmt, attempts, leaderboard)
/pages/typing.html   → Typing Speed game
/pages/reaction.html → Reaction Time game
/pages/memory.html   → Memory Match game
/pages/quiz.html     → CS Quiz game
/pages/crossword.html→ Crossword game
/pages/debug.html    → Code Debug game
/games/              → JS logic for each game (typing.js, reaction.js, memory.js, quiz.js, crossword.js, debug.js)
/data/               → Static game content:
                        - quiz.js        (questionsByRound: {1: GK, 2: Basic CS, 3: Hard CS}, 15 per round)
                        - memory.js      (levels: {easy, medium, hard}, 2 card-pair sets per level)
                        - crosswords.js  (3 puzzles: Easy GK, Medium Basic CS, Hard Advanced CS)
                        - debug.js       (16 code snippets: 5 easy, 6 medium, 5 hard — C/C++/Python)
/lib/                → Shared utilities:
                        - supabaseClient.js  (Supabase client init via CDN)
                        - submitScore.js     (team login, score submission, attempt tracking)
                        - leaderboard.js     (loadLeaderboard — fetches top scores for a game)
```

## Auth & Identity
- **Participant**: Team-based login via dropdown (teams fetched from Supabase `teams` table). Stored in `localStorage.team_name`. Progress persists across devices via Supabase.
- **Admin**: Server-side auth via `/api/admin-login` Vercel serverless function. Credentials stored in Vercel Environment Variables (`ADMIN_USER`, `ADMIN_PASS`) — never exposed to the browser. Session stored in `sessionStorage`.

## Game Rules & Scoring

| Game       | Attempts    | Rounds/Levels                                     | Scoring                                                                              |
|------------|-------------|----------------------------------------------------|--------------------------------------------------------------------------------------|
| Typing     | 5           | Single round, 30s timed                           | Per-attempt: `WPM × (Accuracy% / 100)`. Submitted score = avg of best 3 of all attempts |
| Reaction   | 3           | 7 clicks per attempt (with fakeouts)               | Per-attempt: `max(0, 1000 − avg_reaction_ms)`. Submitted score = avg of all attempt scores |
| Memory     | Per-level   | 3 levels (Easy→Medium→Hard), sequential unlock      | Per-level: `floor((matched/total)*1000 − time) × multiplier` (x1/x1.5/x2). Submitted = sum of all levels |
| Quiz       | 3           | 3 rounds (GK→Basic CS→Hard CS), sequential via attempts | Per-round: `floor((correct/10)*1000 − time)`. Submitted = best score across all rounds |
| Crossword  | Per-puzzle  | 3 puzzles (Easy→Medium→Hard), sequential unlock     | Per-puzzle: `max(0, floor((correct_cells/total_cells)*1000 − time))`. Submitted = sum of all puzzles |
| Debug      | 1 session   | All 16 snippets available, sorted by difficulty     | Per-snippet: 50% pts for correct line + 50% for correct fix. Final: `rawScore − floor(totalTime/2)` |

### Debug Point Weights
- Easy: 100 pts × 5 snippets = 500 pts
- Medium: 200 pts × 6 snippets = 1200 pts
- Hard: 300 pts × 5 snippets = 1500 pts
- **Total available**: 3200 pts (before time penalty)

## Data Persistence Strategy
All games follow a **localStorage-first, Supabase-second** pattern:
1. **localStorage** is updated immediately after each action (attempt count, scores, progress)
2. **Supabase** is written asynchronously (attempt_logs insert + game_scores upsert)
3. On load, games read localStorage first, then fetch from Supabase — using whichever has **more** data (never goes backwards)
4. This prevents data loss on network failures and ensures instant UI feedback

## Admin Features
- **Team Management**: Add/delete team names
- **Attempt Grants**: Give extra attempts for any team+game
- **Progress Reset**: Reset a team's progress for a specific game
- **Leaderboard Toggle**: Show/hide live leaderboard on participant screens (via Supabase `admin_config` table)
- **Live Leaderboard**: Filter by game, aggregated scores

## Supabase Tables (Actual Schema)
- `teams` — `id`, `team_name` (unique), `created_at`
- `game_scores` — `usn` (stores team_name), `game`, `score`, `meta` (jsonb), `updated_at` (unique on usn+game)
- `attempt_logs` — `id`, `usn` (stores team_name), `game`, `score`, `meta` (jsonb), `created_at`
- `extra_attempts` — `id`, `team_name`, `game`, `extra` (int), unique on team_name+game
- `admin_config` — `key` (unique), `value`

## Vercel Routing
See `vercel.json` — clean URLs: `/games`, `/admin`, `/typing`, `/reaction`, `/memory`, `/quiz`, `/crossword`, `/debug`

## Key Lib Functions

### lib/submitScore.js
- `initPlayer()` — Shows team dropdown modal, returns `{ team_name }`. Caches in `localStorage.team_name`.
- `submitScore({ usn, game, score, meta })` — Increments localStorage attempt count → inserts `attempt_logs` → upserts best score to `game_scores`
- `getAttemptInfo(team_name, game, baseAttempts)` — Returns `{ used, allowed, remaining }`. Uses max of localStorage vs Supabase count.
- `getGameAttemptCount(team_name, game)` — Returns attempt count (max of localStorage vs Supabase). Used for sequential unlock checks.
- `checkLeaderboardVisible()` — Polls `admin_config` for `show_leaderboard` toggle state

### lib/leaderboard.js
- `loadLeaderboard(game, limit)` — Fetches top scores from `game_scores`, returns `[{ rank, usn, username, score, meta, updated_at }]`

### lib/supabaseClient.js
- Exports `supabase` client (initialized via CDN `@supabase/supabase-js@2`)
