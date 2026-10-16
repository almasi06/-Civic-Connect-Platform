# Staging Environment

## Purpose

Demonstrates the release candidate in a configuration separate from development.

## Simulated Staging Setup

Given the fixed deadline, staging is provided as a **simulated staging environment** per M3 S14, which explicitly permits: *"teams may instead use a credible simulated staging environment that demonstrates environment-specific configuration, controlled secrets, release identification and verification of the deployed candidate."*

### Configuration

| Field | Value |
|---|---|
| **Host** | Local machine, port 4000 (production build) |
| **Database** | Supabase free tier (Frankfurt) same as dev |
| **Build** | Production build (`npm run build` + `npm run start`) |
| **Secrets** | Loaded via `backend/.env` (never committed) |
| **Access** | `http://localhost:4000` |
| **Demonstration** | Live during the M3 presentation |

### How to Demonstrate

1. Build and start the production build:
   ```bash
   cd backend
   npm run build
   npm run start