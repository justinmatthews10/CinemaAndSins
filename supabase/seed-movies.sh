#!/bin/bash
# Fetch real movie data from TMDB API and insert into Supabase.
# Replaces the hardcoded movies in seed.sql with live data so posters
# and metadata are always correct.
#
# Usage: bash supabase/seed-movies.sh
#
# Requires:
#   - TMDB_API_KEY in .env.local
#   - Supabase running locally (supabase start)
#   - python3 for JSON parsing

set -euo pipefail

# Load env vars from .env.local
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

TMDB_API_KEY="${TMDB_API_KEY:?TMDB_API_KEY is not set in .env.local}"
SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_SECRET_KEY="${SUPABASE_SERVICE_ROLE_KEY:-sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz}"

# Movies to seed: TMDB ID | fixed UUID for relations script
MOVIES=(
  "155|00000000-0000-0000-0001-000000000001"      # The Dark Knight
  "13|00000000-0000-0000-0001-000000000002"       # Forrest Gump
  "27205|00000000-0000-0000-0001-000000000003"    # Inception
  "238|00000000-0000-0000-0001-000000000004"      # The Godfather
  "680|00000000-0000-0000-0001-000000000005"      # Pulp Fiction
  "278|00000000-0000-0000-0001-000000000006"      # The Shawshank Redemption
  "603|00000000-0000-0000-0001-000000000007"      # The Matrix
  "496243|00000000-0000-0000-0001-000000000008"   # Parasite
  "313369|00000000-0000-0000-0001-000000000009"   # La La Land
  "24428|00000000-0000-0000-0001-000000000010"    # The Room
)

fetch_tmdb_movie() {
  local tmdb_id="$1"
  curl -s "https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&append_to_response=credits"
}

insert_movie() {
  local json_payload="$1"
  curl -s -X POST "${SUPABASE_URL}/rest/v1/movies" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal,upsert=tmdb_id" \
    -d "${json_payload}" > /dev/null
}

echo "Fetching movie data from TMDB and inserting into Supabase..."
echo ""

COUNT=0
for entry in "${MOVIES[@]}"; do
  IFS='|' read -r tmdb_id uuid <<< "$entry"

  echo -n "  Fetching TMDB ID ${tmdb_id}... "
  JSON=$(fetch_tmdb_movie "${tmdb_id}")

  # Parse with python3 and build the Supabase insert payload
  PAYLOAD=$(echo "$JSON" | python3 -c "
import sys, json

d = json.load(sys.stdin)
credits = d.get('credits', {})
crew = credits.get('crew', [])
director = next((p['name'] for p in crew if p['job'] == 'Director'), None)

poster_path = d.get('poster_path')
poster_url = f'https://image.tmdb.org/t/p/w500{poster_path}' if poster_path else None

release_date = d.get('release_date', '')
year = int(release_date[:4]) if release_date and len(release_date) >= 4 else None

genres = [g['name'] for g in d.get('genres', [])]

payload = {
    'id': '${uuid}',
    'tmdb_id': d['id'],
    'title': d['title'],
    'year': year,
    'director': director,
    'runtime': d.get('runtime'),
    'poster_url': poster_url,
    'synopsis': d.get('overview') or None,
    'genres': genres,
}
print(json.dumps(payload))
")

  insert_movie "${PAYLOAD}"
  TITLE=$(echo "$PAYLOAD" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
  echo "${TITLE} ✓"
  COUNT=$((COUNT + 1))
done

echo ""
echo "Done! ${COUNT} movies seeded with live TMDB data."
