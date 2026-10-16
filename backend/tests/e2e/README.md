# End-to-End Tests

End-to-end tests exercise the full stack (frontend -> API -> database) through a browser or headless browser.

## Purpose

E2E tests verify that critical user journeys work across the integrated system.

## Framework

*(to be confirmed e.g., Playwright, Cypress)*

## M3 minimum

- **2 meaningful E2E cases** (M3 §10 minimum)

## Critical journeys

- Citizen submits a request and can track it
- Admin resolves a request and the status updates for the citizen

## Running locally

```bash
npm run test:e2e
```

## Evidence

CI runs E2E tests automatically on each PR.

## Known limitations

- Slower than unit tests
- Can be flaky under slow network conditions
- Require a working backend and frontend