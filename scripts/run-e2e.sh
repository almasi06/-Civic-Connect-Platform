#!/usr/bin/env bash
# Run end-to-end tests for CivicConnect
# Usage: ./scripts/run-e2e.sh [--base-url https://staging-url]

set -e

BASE_URL="${E2E_BASE_URL:-http://localhost:3000}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "Running E2E tests against: $BASE_URL"

# Framework-specific command (uncomment when framework is set up)

# Playwright:
# BASE_URL="$BASE_URL" npx playwright test

# Cypress:
# CYPRESS_BASE_URL="$BASE_URL" npx cypress run

echo "E2E tests complete."