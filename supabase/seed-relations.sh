#!/bin/bash
# Create picks, reviews, and rotation linked to the actual member IDs.
# Run after seed-users.sh.
#
# Usage: bash supabase/seed-relations.sh

set -euo pipefail

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_SECRET_KEY="${SUPABASE_SERVICE_ROLE_KEY:-sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz}"

# Get member IDs by email
get_member_id() {
  local email="$1"
  curl -s "${SUPABASE_URL}/rest/v1/members?email=eq.${email}&select=id" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null
}

echo "Fetching member IDs..."
JUSTIN_ID=$(get_member_id "justin@example.com")
SARAH_ID=$(get_member_id "sarah@example.com")
MIKE_ID=$(get_member_id "mike@example.com")
EMMA_ID=$(get_member_id "emma@example.com")
ALEX_ID=$(get_member_id "alex@example.com")

echo "  Justin: ${JUSTIN_ID}"
echo "  Sarah:  ${SARAH_ID}"
echo "  Mike:   ${MIKE_ID}"
echo "  Emma:   ${EMMA_ID}"
echo "  Alex:   ${ALEX_ID}"
echo ""

# Helper: insert via REST API (bypasses RLS with service role key)
insert_pick() {
  local movie_id="$1" picker_id="$2" month="$3" year="$4" watch_date="$5" note="$6" status="$7"
  curl -s -X POST "${SUPABASE_URL}/rest/v1/picks" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{\"movie_id\":\"${movie_id}\",\"picker_member_id\":\"${picker_id}\",\"month\":${month},\"year\":${year},\"watch_date\":\"${watch_date}\",\"picker_note\":\"${note}\",\"status\":\"${status}\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null
}

insert_review() {
  local pick_id="$1" member_id="$2" score="$3" text="$4" tags="$5"
  curl -s -X POST "${SUPABASE_URL}/rest/v1/reviews" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"pick_id\":\"${pick_id}\",\"member_id\":\"${member_id}\",\"score\":${score},\"review_text\":\"${text}\",\"tags\":${tags}}" > /dev/null
}

insert_rotation() {
  local order_idx="$1" member_id="$2"
  curl -s -X POST "${SUPABASE_URL}/rest/v1/rotation" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"order_index\":${order_idx},\"member_id\":\"${member_id}\",\"is_active\":true}" > /dev/null
}

MOVIE_DARK_KNIGHT="00000000-0000-0000-0001-000000000001"
MOVIE_FORREST="00000000-0000-0000-0001-000000000002"
MOVIE_INCEPTION="00000000-0000-0000-0001-000000000003"
MOVIE_SHAWSHANK="00000000-0000-0000-0001-000000000006"
MOVIE_MATRIX="00000000-0000-0000-0001-000000000007"
MOVIE_PARASITE="00000000-0000-0000-0001-000000000008"
MOVIE_LALALAND="00000000-0000-0000-0001-000000000009"
MOVIE_THEROOM="00000000-0000-0000-0001-000000000010"

echo "Creating picks..."
# Past picks (Jan-Apr 2026, locked)
PICK_SH=$(insert_pick "${MOVIE_SHAWSHANK}" "${JUSTIN_ID}" 1 2026 "2026-01-16" "The greatest movie ever made? Let's find out." "locked")
PICK_RM=$(insert_pick "${MOVIE_THEROOM}" "${ALEX_ID}" 2 2026 "2026-02-20" "So bad it's good. You will laugh, you will cry." "locked")
PICK_PA=$(insert_pick "${MOVIE_PARASITE}" "${EMMA_ID}" 3 2026 "2026-03-20" "Best Picture winner that actually deserves it." "locked")
PICK_MX=$(insert_pick "${MOVIE_MATRIX}" "${MIKE_ID}" 4 2026 "2026-04-17" "The one that started it all." "locked")
# Recent picks (May-Jul 2026)
PICK_DK=$(insert_pick "${MOVIE_DARK_KNIGHT}" "${SARAH_ID}" 5 2026 "2026-05-15" "Best superhero movie ever made, fight me." "locked")
PICK_FG=$(insert_pick "${MOVIE_FORREST}" "${MIKE_ID}" 6 2026 "2026-06-19" "A classic that holds up." "locked")
PICK_IN=$(insert_pick "${MOVIE_INCEPTION}" "${EMMA_ID}" 7 2026 "2026-07-17" "Mind-bending and rewatchable." "current")
# Upcoming pick (Aug 2026)
PICK_LL=$(insert_pick "${MOVIE_LALALAND}" "${JUSTIN_ID}" 8 2026 "2026-08-21" "Jazz, dreams, and heartbreak." "upcoming")
echo "  Shawshank pick:   ${PICK_SH}"
echo "  The Room pick:    ${PICK_RM}"
echo "  Parasite pick:    ${PICK_PA}"
echo "  Matrix pick:      ${PICK_MX}"
echo "  Dark Knight pick: ${PICK_DK}"
echo "  Forrest Gump pick: ${PICK_FG}"
echo "  Inception pick:    ${PICK_IN}"
echo "  La La Land pick:   ${PICK_LL}"
echo ""

echo "Creating reviews..."
# Shawshank Redemption reviews (Jan 2026) — universally loved
insert_review "${PICK_SH}" "${JUSTIN_ID}" 10.0 "A masterpiece. Every scene serves the story. Freeman's narration is perfect." '["rewatch"]'
insert_review "${PICK_SH}" "${SARAH_ID}" 9.5 "One of the few movies that earns its runtime. The ending gets me every time." '[]'
insert_review "${PICK_SH}" "${MIKE_ID}" 9.0 "Incredible storytelling. The pacing is immaculate." '[]'
insert_review "${PICK_SH}" "${EMMA_ID}" 9.5 "The friendship between Andy and Red is the heart of this film." '[]'
insert_review "${PICK_SH}" "${ALEX_ID}" 8.5 "Great but slightly overrated. Still a classic though." '[]'

# The Room reviews (Feb 2026) — universally panned but fun
insert_review "${PICK_RM}" "${JUSTIN_ID}" 2.0 "Technically one of the worst movies ever made. We had a blast." '[]'
insert_review "${PICK_RM}" "${SARAH_ID}" 1.0 "Oh hi Mark. This movie is a disaster and I love it." '[]'
insert_review "${PICK_RM}" "${MIKE_ID}" 3.0 "So bad it circles back to entertaining. The football scene alone." '[]'
insert_review "${PICK_RM}" "${EMMA_ID}" 1.5 "I can't believe this exists. The acting is beyond terrible." '[]'
insert_review "${PICK_RM}" "${ALEX_ID}" 2.5 "You tore me apart, Lisa. A so-bad-it's-good classic." '[]'

# Parasite reviews (Mar 2026) — mostly loved, one dissenter
insert_review "${PICK_PA}" "${JUSTIN_ID}" 9.5 "Bong Joon-ho is a genius. The tonal shift halfway through is masterful." '[]'
insert_review "${PICK_PA}" "${SARAH_ID}" 9.0 "Every frame is carefully composed. The social commentary is sharp." '[]'
insert_review "${PICK_PA}" "${MIKE_ID}" 8.5 "Brilliant filmmaking. The basement reveal is one of the best scenes of the decade." '[]'
insert_review "${PICK_PA}" "${EMMA_ID}" 10.0 "Perfect. I've seen it three times and notice something new each time." '["rewatch"]'
insert_review "${PICK_PA}" "${ALEX_ID}" 5.0 "I don't get the hype. It's fine but best picture? Really?" '[]'

# The Matrix reviews (Apr 2026) — generally liked, some mixed
insert_review "${PICK_MX}" "${JUSTIN_ID}" 8.5 "Still holds up. The bullet time sequences were revolutionary." '["rewatch"]'
insert_review "${PICK_MX}" "${SARAH_ID}" 7.0 "Great concept but the sequels ruined the mystique for me." '[]'
insert_review "${PICK_MX}" "${MIKE_ID}" 9.0 "The green tint, the leather, the philosophy. Iconic." '[]'
insert_review "${PICK_MX}" "${EMMA_ID}" 7.5 "Groundbreaking for its time but some of the CGI has aged." '[]'
insert_review "${PICK_MX}" "${ALEX_ID}" 6.0 "Cool action but the pseudo-philosophy gets old fast." '[]'

# Dark Knight reviews (May 2026) — high but one contrarian
insert_review "${PICK_DK}" "${JUSTIN_ID}" 9.5 "Heath Ledger is unreal. The pacing drags in the third act but the set pieces are incredible." '["rewatch"]'
insert_review "${PICK_DK}" "${SARAH_ID}" 10.0 "Perfect. No notes." '[]'
insert_review "${PICK_DK}" "${MIKE_ID}" 8.0 "Great but overhyped. The ferry scene is heavy-handed." '[]'
insert_review "${PICK_DK}" "${EMMA_ID}" 9.0 "Ledger alone makes this worth it. The score is iconic." '[]'
insert_review "${PICK_DK}" "${ALEX_ID}" 7.5 "Good action movie but I prefer Begins." '[]'

# Forrest Gump reviews (Jun 2026) — mixed feelings
insert_review "${PICK_FG}" "${JUSTIN_ID}" 8.0 "Emotional but some of the CGI has not aged well." '[]'
insert_review "${PICK_FG}" "${SARAH_ID}" 7.0 "A bit saccharine for me. Hanks is great though." '[]'
insert_review "${PICK_FG}" "${MIKE_ID}" 9.0 "Grew up watching this. Holds a special place." '["rewatch"]'
insert_review "${PICK_FG}" "${EMMA_ID}" 8.5 "The soundtrack is perfect. The story meanders but in a good way." '[]'
insert_review "${PICK_FG}" "${ALEX_ID}" 6.5 "Too long and too sentimental. Feels like Oscar bait." '[]'

# Inception reviews (Jul 2026, current) — only 3 so far
insert_review "${PICK_IN}" "${JUSTIN_ID}" 8.5 "Nolan at his most ambitious. The hallway fight alone is worth it." '["rewatch"]'
insert_review "${PICK_IN}" "${SARAH_ID}" 9.0 "The dream-within-a-dream structure is brilliant. Hans Zimmer's score is thunderous." '[]'
insert_review "${PICK_IN}" "${MIKE_ID}" 7.0 "Cool ideas but too much exposition. Just show me don't tell me." '[]'

echo "  33 reviews created"
echo ""

echo "Creating rotation..."
insert_rotation 0 "${JUSTIN_ID}"
insert_rotation 1 "${SARAH_ID}"
insert_rotation 2 "${MIKE_ID}"
insert_rotation 3 "${EMMA_ID}"
insert_rotation 4 "${ALEX_ID}"
echo "  5 rotation entries created"
echo ""

echo "Done!"
