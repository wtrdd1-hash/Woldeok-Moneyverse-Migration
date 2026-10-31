# v2026.10.31.1550 — Production deployment changelog

- Released PR #2165 merged exact main SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16` after official Test runtime identity passed.
- Production canonical DB migration 313 (audited approver-only policy) applied with checksum and without widening raw SWF table privileges or adjusting balances.
- Zero-downtime Nginx switch to persistent v1550 web backend:4164 and frontend:4165; previous production web services pinned to prior immutable code for rollback.
- Production host SHA identity `ok:true`, public site pages and authorization-negative smoke passed.
- Treasury provenance 552 unlinked entries remain deliberately blocked; financial settlements still 503.
