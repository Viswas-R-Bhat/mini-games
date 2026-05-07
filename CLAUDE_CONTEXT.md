Project Overview

This is a mini-games event website deployed on Vercel.
Multiple browser games share the same player system, leaderboard system, and scoring pipeline.

Games include:

Typing Speed Challenge
Crossword Puzzle (dynamic, data-driven)
More games will be added later

This is not a static site. This is a shared game platform.

Core Architecture Rules (MUST FOLLOW)
1) Shared player + leaderboard system (DO NOT MODIFY)

Located in /lib/:

initPlayer()
submitScore({ usn, game, score, meta })
loadLeaderboard(game)

All games MUST use these.
No new storage formats. No new score systems.

2) Game Structure (strict)

Each game has exactly:

/pages/<game>.html → UI only
/games/<game>.js → engine/logic only
/data/<game>.js → content/data only

Engine must NEVER contain puzzle/content.
Data file must NEVER contain logic.

3) Crossword is DATA DRIVEN

The crossword engine:

Reads puzzles ONLY from /data/crosswords.js
Picks one randomly
Renders based on gridSize, grid, across, down
Adding a new puzzle = editing data file ONLY
Engine code must never change when adding puzzles
4) Mandatory Crossword Validation Layer

Before rendering ANY crossword, engine MUST run:

validateCrossword(crossword)

If invalid:

Do NOT render
Show: "Invalid crossword dataset"
Log exact errors

Validation checks:

Grid dimensions
Across length correctness
Down length correctness
Intersection letter consistency
Orphan cells
Correct clue start positions

This prevents broken puzzles from ever appearing.

5) Scoring Rule (all games)

Score formula:

score = floor((correct / total) * 1000 - timeTaken)

Timer starts on first keypress.

6) UI vs Logic Separation

Claude must NEVER mix:

DOM/UI code inside data
Puzzle logic inside HTML
Puzzle content inside engine
7) Login System

Site uses:

Login with Google
Login with GitHub

Player identity is taken from OAuth profile.
USN is still collected and attached to the player.

8) Adding New Games Later

When adding a new game:

It MUST plug into existing:

initPlayer
submitScore
leaderboard

No reinvention.

What Claude’s Role Is

Claude is the coder.

Claude must:

Respect architecture
Write modular files
Never hardcode content
Never break shared systems
Think like building a platform, not a page
What ChatGPT’s Role Is

ChatGPT designs:

Game logic
Data formats
Architecture
Validation rules
Future-proof structure

Claude implements exactly that.

Golden Rule

If a change requires editing more than one layer (data, engine, UI),
Claude is doing it wrong.
