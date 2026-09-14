# v2026.09.15.96 — Shop search, authoritative work controls, and HTTPS hardening

## Summary

- Added optional `q` search to the shop items, authenticated catalogue, and public catalogue APIs.
- Added a website shop search form using the same server-side query contract.
- Business purchase catalogues now exclude business types the signed-in user already owns.
- Registered the `work` feature switch in the control plane and enforced it in work/job write APIs.
- `GET /api/v1/work/tasks` now reports the effective `featureState` so mobile clients can mirror administrator restrictions.
- Added a Production HTTP-to-HTTPS 308 redirect while preserving the existing HSTS, CSP, secure cookies, and private loopback backend architecture.

## Compatibility

- `GET /api/v1/work/profile` keeps its existing response shape.
- The new `featureState` field on the task-board envelope is additive.
- Shop search is optional; requests without `q` retain the previous full-catalog behaviour.

## Work switch semantics

- `enabled`: new and in-flight work is allowed.
- `paused` / `safe_mode`: no new job switch, assignment, or instant completion; already assigned work may finish.
- `disabled`: work write operations are blocked.

## Release gate

CI must pass before merge. After merge, the immutable main SHA must pass the isolated Test backend/database gate before Production promotion.