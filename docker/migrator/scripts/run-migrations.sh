#!/bin/sh
set -e

CONN="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB"

# Ensure migrations tracking table exists
psql "$CONN" <<'EOSQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  id serial PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  applied_at timestamptz NOT NULL DEFAULT now()
);
EOSQL

# Apply only new migrations
for f in /migrations/*.sql; do
  BASENAME=$(basename "$f")
  APPLIED=$(psql -qtAX "$CONN" -c "SELECT 1 FROM schema_migrations WHERE filename = '$BASENAME'")
  if [ "$APPLIED" = "1" ]; then
    echo "Skipping already applied migration: $BASENAME"
  else
    echo "Applying migration: $BASENAME"
    psql "$CONN" -f "$f"
    psql "$CONN" -c "INSERT INTO schema_migrations (filename) VALUES ('$BASENAME')"
  fi
done

echo "✅ All migrations applied."
