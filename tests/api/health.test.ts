// tests/api/health.test.ts
//
// Test basis: NFR-05 (uptime) — the health endpoint confirms the service is running
// Why selected: simplest end-to-end proof that the API is reachable
// Technique/level: API integration test
//
// Traceability: NFR-05, negative testing

import { describe, it, expect } from 'vitest';

const API_URL = process.env.API_BASE_URL || 'http://localhost:4000';

describe('Health endpoint', () => {
  it('GET /health returns 200 with an ok field', async () => {
    const res = await fetch(`${API_URL}/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('ok');
    expect(body.ok).toBe(true);
  });

  it('GET /health reports the current database status', async () => {
    const res = await fetch(`${API_URL}/health`);
    const body = await res.json();

    expect(body).toHaveProperty('db');
    expect(['connected', 'disconnected']).toContain(body.db);
  });

  it('GET /nonexistent returns 404 (negative test)', async () => {
    const res = await fetch(`${API_URL}/nonexistent-route-xyz`);
    expect(res.status).toBe(404);
  });
});