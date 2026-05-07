# ReAIvive — The AI Resurrection Challenge

## Project Overview
A tech-fest mini-game platform for BMSCE VarAInce, featuring competitive challenges with team-based login, admin moderation, and a live leaderboard system.

## Technology Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ESM)
- **Backend/Database**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel (static)

## Architecture
```
/index.html         → Landing page (ReAIvive branding, Admin/Participant buttons)
/games_list.html    → Participant game list (team login, game cards, leaderboard banner)
/pages/admin.html   → Admin dashboard (login, team mgmt, attempts, leaderboard)
/pages/typing.html  → Typing Speed game
/pages/reaction.html→ Reaction Time game
/pages/memory.html  → Memory Match game
/pages/quiz.html    → CS Quiz game
/pages/crossword.html→ Crossword game
/pages/debug.html   → Code Debug game
/games/             → JS logic for each game
/data/              → Static game content (questions, puzzles, snippets)
/lib/               → Shared utilities (supabaseClient.js, submitScore.js)
```

## Auth & Identity
- **Participant**: Team-based login via dropdown (teams fetched from Supabase `teams` table). Stored in `localStorage.team_name`. Progress persists across devices via Supabase.
- **Admin**: Hardcoded credentials — `varaince` / `ReAIvive14052026`. Session stored in `sessionStorage`.

## Game Rules & Scoring
| Game       | Attempts    | Scoring                                              |
|------------|-------------|------------------------------------------------------|
| Typing     | 5           | Best 3 of 5 averaged. Score = WPM × Accuracy %      |
| Reaction   | 3           | All 3 averaged. Score = 1000 − avg_reaction_ms       |
| Memory     | Per-level   | 3 levels (Easy→Medium→Hard). Sequential unlock. x1/x1.5/x2 multiplier |
| Quiz       | 3           | Best score kept. Score = (correct/total)*1000 − time |
| Crossword  | Per-puzzle  | 3 puzzles (1 Easy, 2 Hard). Sequential unlock. Score = accuracy*1000 − time |
| Debug      | 1 session   | All snippets available. Easy=100, Medium=200, Hard=300 pts. C/C++/Python only |

## Admin Features
- **Team Management**: Add/delete team names
- **Attempt Grants**: Give extra attempts for any team+game
- **Progress Reset**: Reset a team's progress for a specific game
- **Leaderboard Toggle**: Show/hide live leaderboard on participant screens (via Supabase `admin_config` table)
- **Live Leaderboard**: Filter by game, aggregated scores

## Supabase Tables Required
- `teams` — `id`, `team_name` (unique), `created_at`
- `game_scores` — `team_name`, `game`, `score`, `meta` (jsonb), `updated_at` (unique on team_name+game)
- `attempt_logs` — `team_name`, `game`, `score`, `meta` (jsonb), `created_at`
- `extra_attempts` — `team_name`, `game`, `extra` (int), unique on team_name+game
- `admin_config` — `key` (unique), `value`

## Vercel Routing
See `vercel.json` — clean URLs: `/games`, `/admin`, `/typing`, `/reaction`, etc.

## Key Lib Functions (lib/submitScore.js)
- `initPlayer()` — Shows team dropdown modal, returns `{ team_name }`
- `submitScore({ usn, game, score, meta })` — Logs attempt + upserts best score
- `getAttemptInfo(team_name, game, baseAttempts)` — Returns `{ used, allowed, remaining }`
- `checkLeaderboardVisible()` — Polls `admin_config` for leaderboard toggle state
