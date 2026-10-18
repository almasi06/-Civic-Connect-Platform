import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server/app';

describe('Health Check API', () => {
  it('TC-API-01: GET /health should return 200 and db connected', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('db', 'connected');
  });
});