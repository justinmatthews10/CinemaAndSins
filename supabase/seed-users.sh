#!/bin/bash
# Create test users via the Supabase Auth signup API.
# Run this after `supabase start` or `supabase db reset`.
#
# The handle_new_user trigger creates member rows with is_approved = FALSE.
# This script then updates the member rows to set admin/approval flags.
#
# Usage: bash supabase/seed-users.sh

set -euo pipefail

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH}"
SUPABASE_SECRET_KEY="${SUPABASE_SERVICE_ROLE_KEY:-sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz}"

PASSWORD="password123"

# Try to create a user via signup API. If already exists, fetch ID via admin API.
create_user() {
  local email="$1"
  local name="$2"
  local response
  response=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${PASSWORD}\",\"data\":{\"name\":\"${name}\"}}")

  # Try to extract id from signup response
  local user_id
  user_id=$(echo "${response}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null || echo "")

  if [ -n "${user_id}" ]; then
    echo "${user_id}"
    return
  fi

  # User already exists — fetch via admin API
  user_id=$(curl -s "${SUPABASE_URL}/auth/v1/admin/users?email=${email}" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); users=d.get('users',[]); print(users[0]['id'] if users else '')" 2>/dev/null || echo "")

  echo "${user_id}"
}

# Update member flags using the service role key (bypasses RLS)
update_member() {
  local user_id="$1"
  local is_admin="$2"
  local is_approved="$3"
  curl -s -X PATCH "${SUPABASE_URL}/rest/v1/members?id=eq.${user_id}" \
    -H "apikey: ${SUPABASE_SECRET_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SECRET_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"is_admin\":${is_admin},\"is_approved\":${is_approved}}" > /dev/null
}

echo "Creating test users..."

USER_MAP=$(mktemp)
trap 'rm -f "$USER_MAP"' EXIT

create_and_record() {
  local email="$1"
  local name="$2"
  local user_id
  user_id=$(create_user "${email}" "${name}")
  if [ -n "${user_id}" ]; then
    echo "${email} ${user_id}" >> "$USER_MAP"
    echo "  ${email} -> ${user_id}"
  else
    echo "  FAILED: ${email}"
  fi
}

create_and_record "justin@example.com" "Justin"
create_and_record "sarah@example.com" "Sarah"
create_and_record "mike@example.com" "Mike"
create_and_record "emma@example.com" "Emma"
create_and_record "alex@example.com" "Alex"
create_and_record "pending@example.com" "Pending User"

echo ""
echo "Updating member profiles..."

get_id() {
  grep "^$1 " "$USER_MAP" | awk '{print $2}'
}

JUSTIN_ID=$(get_id "justin@example.com")
SARAH_ID=$(get_id "sarah@example.com")
MIKE_ID=$(get_id "mike@example.com")
EMMA_ID=$(get_id "emma@example.com")
ALEX_ID=$(get_id "alex@example.com")

if [ -n "${JUSTIN_ID}" ]; then
  update_member "${JUSTIN_ID}" "true" "true"
  echo "  Justin: admin + approved"
fi

for email in sarah@example.com mike@example.com emma@example.com alex@example.com; do
  uid=$(get_id "$email")
  if [ -n "${uid}" ]; then
    update_member "${uid}" "false" "true"
    echo "  ${email}: approved"
  fi
done

echo "  pending@example.com: stays unapproved"

echo ""
echo "Done! Test users created with password: ${PASSWORD}"
