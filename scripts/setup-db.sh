#!/usr/bin/env bash
# Setup database schema for CivicConnect
# Usage: ./scripts/setup-db.sh

set -e

echo "Setting up CivicConnect database..."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Copy .env.example to .env and fill in values."
  exit 1
fi

echo "Running migrations..."
# Uncomment the appropriate line for your setup:

# Prisma:
# npx prisma migrate deploy

# Raw SQL:
# psql "$DATABASE_URL" -f backend/db/migrations/001_init.sql

echo "Database setup complete."