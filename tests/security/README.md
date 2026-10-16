# Security Tests

Security tests verify that authentication, authorisation, and input validation behave correctly under adversarial conditions.

## Purpose

Negative and unauthorised-access tests (M3 §10 requires at least 3 across the overall suite).

## Test categories

| Category | Example |
|---|---|
| Authentication failures | Invalid credentials, expired JWT |
| Authorisation failures | Citizen attempts admin action |
| Input validation | SQL injection attempts, XSS payloads |
| Rate limiting | Brute-force login attempts |
| Session management | Session expiry, concurrent sessions |

## Files

| File | Scenario |
|---|---|
| *(to be added)* | |

## Running locally

```bash
npm run test:security
```

## Evidence

CI runs security tests automatically. Results recorded in `documents/Project_Engineering_Document/26-defects-quality.md`.

## Related

- Defects: `documents/Registers/defect-register.md`
- Risks: `documents/Project_Engineering_Document/12-risk-register.md`