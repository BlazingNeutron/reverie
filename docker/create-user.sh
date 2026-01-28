#!/usr/bin/env bash
#
# create-user.sh – create a new user in PostgreSQL
#
# Usage:
#   ./create-user.sh <email> <password>
#
# Required environment variables (or .pgpass):
#   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
#
# The script passes the two arguments to create-user.sql as
#   :new_email   and   :new_password
#

set -euo pipefail   # strict mode

# ---- Auto‑load .env if it exists ---------------------------------
if [[ -f ".env" ]]; then
    # Export each line; ignore comments and blank lines
    set -a                     # automatically export all variables defined
    source ".env"
    set +a
fi

# ---------- Argument validation ----------
if [[ $# -ne 2 ]]; then
    echo "Error: Exactly two arguments required." >&2
    usage
fi

NEW_EMAIL=$1
NEW_PASSWORD=$2

export PGPASSWORD=$POSTGRES_PASSWORD

# ---------- Run the SQL ----------
echo "▶️  Creating user \"$NEW_EMAIL\" …"

docker compose exec db psql "host=${PGHOST} port=${PGPORT:-5432} dbname=${PGDATABASE} user=${PGUSER}" \
    -v ON_ERROR_STOP=1 \
    -v new_email="'${NEW_EMAIL}'" \
    -v new_password="'${NEW_PASSWORD}'" \
    -f "/scripts/create-user.sql"

echo "✅  User created (or an error was reported above)."
