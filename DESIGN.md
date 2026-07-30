# CinemaAndSins — Movie Club Web App

## Vision

A private, members-only web app where the club schedules monthly movie picks, records everyone's 1–10 scores and written reviews, and builds a lasting archive of the club's history. Cinematic dark theme, poster-forward, feels like a curated film journal.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js (React) + TypeScript | SSR/SSG, routing, ecosystem |
| Styling | Tailwind CSS | Fast, consistent, easy dark theme |
| Backend / Auth / DB | Supabase (Postgres + email auth + RLS) | Free tier covers a club this size; email-based signup; row-level security |
| Movie data | TMDB API (free) | Posters, synopsis, year, director, runtime, genre |
| Hosting | Vercel | Auto-deploys from GitHub on every push |

**Why this stack:** Free to run, scales fine for 9+ members, email-based signup matches the access requirement, and the GitHub → Vercel pipeline means every push goes live automatically.

---

## User Roles & Access

### Public (no login)
- Can view the schedule, history, and movie detail pages.
- Read-only.

### Member (email-verified)
- Add a movie pick when it's their turn.
- Submit their score + review for the current movie.
- Edit their own reviews.
- View their profile and stats.

### Admin
- Everything a member can do, plus:
  - Invite / approve members.
  - Set and reorder the rotation.
  - Edit / delete any content.
  - Lock a month's reviews after the meeting.

### Signup Flow
1. Admin invites members by email (or approves pending signups).
2. Members create an account with email + password.
3. Only approved emails get member access — keeps it club-only.

---

## Pages

### 1. Home / Current Movie of the Month
- Hero banner with the current movie's poster, title, year, director, runtime.
- "Picked by [member name]" badge.
- Watch-by date / meeting date with countdown.
- Synopsis from TMDB.
- Personal status: "You haven't reviewed this yet" → button to review, or "You rated this 8/10" with link to your review.
- Quick stats: how many members have reviewed so far (e.g. "7 of 11 reviewed").
- Next up teaser: who picks next month.

### 2. Schedule
- Timeline / calendar view of upcoming months.
- Each slot shows: month, assigned picker, status (not picked yet / movie selected / locked).
- Members can click their slot to add their pick.
- Admin can reorder the rotation, skip someone, or assign a substitute.
- Rotation logic: cycles through all members, then repeats. Handles absences (skip + bump).
- Past months collapse into the history view.

### 3. History / Archive
- Grid or list of all past movies, newest first.
- Each card: poster, title, year, average score (big), number of reviewers, picker.
- Sort / filter: by year, by average score, by genre, by picker, by "most divisive" (highest score variance).
- Search by title.
- Click any movie → movie detail page.

### 4. Movie Detail Page
- Full poster + metadata (director, year, runtime, genre, TMDB rating for comparison).
- "Picked by [member] in [month year]".
- **Average score** prominently displayed, with a score distribution chart (how many 10s, 9s, etc.).
- **Individual reviews section:** each member's name, their score (as a badge), and their written review. Sorted by score or by name.
- "Most divisive" indicator (if scores vary widely, a "Hot Take" tag).
- Comments thread (optional — for post-meeting discussion).

### 5. Add a Movie (member's pick submission)
- Search TMDB by title → auto-fills poster, metadata.
- Or enter manually if not on TMDB.
- Set the watch-by / meeting date.
- Add a note from the picker ("Why I picked this").
- Submit → appears on schedule + becomes the current movie of the month when its month arrives.

### 6. Submit a Review
- Score slider 1–10 (whole numbers or decimals — TBD).
- Written review (markdown supported, character limit optional).
- Optional: tags like "rewatch", "first time".
- Editable until the month is locked by admin.
- Visible to other members as they come in (default).

### 7. Member Profile
- Avatar, name, member since.
- Stats:
  - Number of reviews.
  - Average score given.
  - Average score given vs. club average (harsh grader vs. generous grader).
  - Most-rated genre.
- Their pick history (which movies they've picked).
- Their review history (sortable).
- "Harsh critic" / "Easy grader" badge based on their average vs. the club's.

### 8. Stats / Insights (club-wide)
- Club leaderboard: highest-rated movies of all time, lowest-rated.
- Most divisive movies (highest score variance).
- Rating tendencies per member (who's the toughest grader).
- Genre breakdown of what you've watched.
- "Club average over time" trend.

### 9. Admin Dashboard
- Member management: invite, approve, remove, set admin.
- Rotation editor: drag-to-reorder the picking order.
- Lock / unlock months (freezes reviews after the meeting).
- Edit / delete any movie or review (with audit log).

---

## Data Model (simplified)

### `members`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| email | text | unique |
| name | text | |
| avatar_url | text | |
| is_admin | boolean | default false |
| created_at | timestamptz | |

### `movies`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tmdb_id | integer | nullable (if entered manually) |
| title | text | |
| year | integer | |
| director | text | |
| runtime | integer | minutes |
| poster_url | text | |
| synopsis | text | |
| genre | text[] | |

### `picks`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| movie_id | uuid | FK → movies |
| picker_member_id | uuid | FK → members |
| month | integer | 1–12 |
| year | integer | |
| watch_date | date | |
| picker_note | text | "Why I picked this" |
| status | text | `upcoming` / `current` / `locked` |
| created_at | timestamptz | |

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| pick_id | uuid | FK → picks |
| member_id | uuid | FK → members |
| score | numeric(3,1) | 1.0–10.0 |
| review_text | text | markdown |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `rotation`
- Ordered list of member IDs, managed by admin.
- Stored as a separate table or a JSON column on a club-settings row.

---

## Scoring Rules

- Scale: 1–10. (Whole numbers vs. decimals — TBD.)
- Average is a straight mean across all members who reviewed.
- A movie needs a minimum number of reviews (e.g. 5) to appear in "all-time" rankings, to avoid a single 10/10 skewing the list.

---

## Design / Visual Direction

- **Theme:** Dark cinematic. Near-black background (`#0a0a0f`), warm accent (amber/gold like a marquee, or deep red like a cinema curtain).
- **Posters** are the visual anchor — large, high quality.
- **Typography:** Display serif for titles (film-poster / classic-cinema feel) + clean sans for body.
- **Score badges:**
  - Gold: 9–10
  - Green: 7–8
  - Yellow: 5–6
  - Red: 1–4
- Subtle film-grain texture or vignette on hero sections.
- Smooth transitions, hover states on cards.

---

## Future Enhancements (not v1)

- Email reminders when it's your turn to pick / when the meeting is approaching.
- "Where to watch" links (JustWatch integration).
- Watch-along scheduling.
- Export the archive as a printed yearbook PDF.
- Mobile app / PWA install.

---

## Open Questions

1. **Scores:** whole numbers (1–10) or allow decimals (7.5)?
2. **Reviews visible as submitted, or hidden until you post yours?** (Default: visible.)
3. **Public visibility:** should non-members be able to browse the history, or is the whole site members-only top to bottom?
4. **Club name confirmation:** "CinemaAndSins" — is that the club name, or just the repo name? Any tagline?
