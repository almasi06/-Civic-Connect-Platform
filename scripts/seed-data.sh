#!/usr/bin/env bash
# Seed CivicConnect with test data
# Usage: ./scripts/seed-data.sh

set -e

echo "Seeding test data..."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

# Run seed script
# Uncomment the appropriate line for your setup:

# Prisma:
# npx prisma db seed

# Custom Node script:
# node backend/db/seed.js

echo "Seeding complete."