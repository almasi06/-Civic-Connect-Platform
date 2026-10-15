# Defect Register

**Owner:** Davidzo Malapile, Naledi Moeng, Kamohelo Mabena
**Version:** v1.0 (M3)
**Last Updated:** 2026-10-15

---

## Purpose

This register records defects, failures and quality findings discovered during
Milestone 3 construction and verification. Each defect is tracked from
discovery through fix, with regression evidence linking back to the test suite.

A "defect" is any observed behavior that deviates from the expected behaviour
defined by a requirement, acceptance criterion, or architectural decision.

---

## Defect States

| State | Meaning |
|-------|---------|
| **Open** | Identified, not yet fixed |
| **In Progress** | Fix under development |
| **Fixed** | Code/decision updated, awaiting verification |
| **Verified** | Fix confirmed by test/evidence |
| **Closed** | Fully resolved; no further action |
| **Won't Fix** | Accepted as known limitation (must be justified) |

---

## Summary

| Metric | Count |
|--------|-------|
| Total defects recorded | 28 |
| Closed (fixed and verified) | 28 |
| Open | 0 |
| Won't Fix | 0 |

---

## Notes

- Defects DEF-001 to DEF-019 were identified during M3 backend rewrite.
- Defects DEF-020 to DEF-028 were identified during M3 test suite construction and frontend integration.
- All defects are closed with regression evidence linking to test cases or manual verification.
- See Technical Debt Register for accepted residual compromises.
