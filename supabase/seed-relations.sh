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

echo "Creating picks..."
PICK_DK=$(insert_pick "${MOVIE_DARK_KNIGHT}" "${SARAH_ID}" 5 2026 "2026-05-15" "Best superhero movie ever made, fight me." "locked")
PICK_FG=$(insert_pick "${MOVIE_FORREST}" "${MIKE_ID}" 6 2026 "2026-06-19" "A classic that holds up." "locked")
PICK_IN=$(insert_pick "${MOVIE_INCEPTION}" "${EMMA_ID}" 7 2026 "2026-07-17" "Mind-bending and rewatchable." "current")
echo "  Dark Knight pick: ${PICK_DK}"
echo "  Forrest Gump pick: ${PICK_FG}"
echo "  Inception pick:    ${PICK_IN}"
echo ""

echo "Creating reviews..."
# Dark Knight reviews
insert_review "${PICK_DK}" "${JUSTIN_ID}" 9.5 "Heath Ledger is unreal. The pacing drags in the third act but the set pieces are incredible." '["rewatch"]'
insert_review "${PICK_DK}" "${SARAH_ID}" 10.0 "Perfect. No notes." '[]'
insert_review "${PICK_DK}" "${MIKE_ID}" 8.0 "Great but overhyped. The ferry scene is heavy-handed." '[]'
insert_review "${PICK_DK}" "${EMMA_ID}" 9.0 "Ledger alone makes this worth it. The score is iconic." '[]'
insert_review "${PICK_DK}" "${ALEX_ID}" 7.5 "Good action movie but I prefer Begins." '[]'
# Forrest Gump reviews
insert_review "${PICK_FG}" "${JUSTIN_ID}" 8.0 "Emotional but some of the CGI has not aged well." '[]'
insert_review "${PICK_FG}" "${SARAH_ID}" 7.0 "A bit saccharine for me. Hanks is great though." '[]'
insert_review "${PICK_FG}" "${MIKE_ID}" 9.0 "Grew up watching this. Holds a special place." '["rewatch"]'
insert_review "${PICK_FG}" "${EMMA_ID}" 8.5 "The soundtrack is perfect. The story meanders but in a good way." '[]'
insert_review "${PICK_FG}" "${ALEX_ID}" 6.5 "Too long and too sentimental. Feels like Oscar bait." '[]'
echo "  10 reviews created"
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
