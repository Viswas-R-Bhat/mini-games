# MiniGames — BMSCE Tech Fest

A multi-game event website hosted on **Vercel** with scores stored in **Supabase**.

---

## Project Structure

```
/
├── index.html              ← Homepage / game hub
├── vercel.json             ← Vercel routing config
│
├── lib/
│   ├── supabaseClient.js   ← Supabase init (set your keys here)
│   ├── submitScore.js      ← initPlayer() + submitScore()
│   └── leaderboard.js      ← loadLeaderboard(game)
│
├── games/
│   └── typing.js           ← Typing Speed game logic
│
└── pages/
    └── typing.html         ← Typing Speed page
```

---

## 1 · Supabase Setup

Your Supabase project must have these tables (already created per spec):

```sql
-- players
create table players (
  usn        text primary key,
  username   text not null,
  created_at timestamptz default now()
);

-- game_scores  (best score per player per game)
create table game_scores (
  usn        text references players(usn),
  game       text,
  score      int  default 0,
  meta       jsonb,
  updated_at timestamptz default now(),
  primary key (usn, game)
);

-- attempt_logs  (every single attempt)
create table attempt_logs (
  id         bigserial primary key,
  usn        text references players(usn),
  game       text,
  score      int,
  meta       jsonb,
  created_at timestamptz default now()
);
```

### RLS (Row Level Security)

Enable RLS on all tables and add these permissive policies so the
anonymous key can read/write:

```sql
-- players
create policy "allow all" on players for all using (true) with check (true);

-- game_scores
create policy "allow all" on game_scores for all using (true) with check (true);

-- attempt_logs
create policy "allow all" on attempt_logs for all using (true) with check (true);
```

---

## 2 · Configure Supabase Keys

Open `lib/supabaseClient.js` and replace the placeholders:

```js
const SUPABASE_URL      = 'https://xxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
```

Find these values in your Supabase dashboard:
**Project Settings → API → Project URL & anon public key**

---

## 3 · Deploy to Vercel

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# From the project root
vercel
```

Or connect the repo in the Vercel dashboard and it will deploy automatically.

---

## 4 · Adding New Games

1. Create `/games/mygame.js` — import `initPlayer`, `submitScore`, `loadLeaderboard` from `/lib/`
2. Create `/pages/mygame.html`
3. Add a card to `index.html`
4. Add a rewrite rule to `vercel.json`

**Do NOT** create new tables or storage. Use the shared `submitScore()` with `game: "mygame"`.

---

## Score Formula — Typing Speed

| Metric | Formula |
|--------|---------|
| Accuracy | `(correct_chars / total_typed) × 100` |
| WPM | `correct_chars / 5` |
| **Score** | `floor(WPM × (accuracy / 100))` |

Meta stored: `{ wpm, accuracy, timeTaken: 60, paragraphLength }`

---

## Anti-Cheat

- Copy / cut / right-click disabled on textarea
- Paste detected → game ends immediately, score forced to 0
- Page refresh → new random paragraph

---

## Player Identity

- First visit: modal asks for **Username** + **USN**
- Stored in `localStorage` (`usn`, `username`)
- Inserted into `players` table (upsert — safe to re-run)
- Never asked again on subsequent visits
- "Change player" button on homepage clears localStorage
