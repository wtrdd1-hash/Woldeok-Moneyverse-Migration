# C v1334 — Notification search response limit evidence

Start (2026-11-03 14:46 KST): remote miniPC services 7/7 active and development PostgreSQL connected. Base origin/main 8c5caae4e2999ea577ee4df342f8ef83c43582f8. Read AGENTS, README and Korean guide, English/Korean planning, open PRs; kept A/B/QA/Gemini branches and dirty primary worktree untouched.

Middle: found owner notification search BFF accepts up to 50 items even when request explicitly limits to 1. Added a regression test, observed HTTP 200 instead of expected 503 (RED). Bound upstream result count to the requested limit (or default 50). No database, authorization or finance changes. Focused Vitest 4/4 PASS; frontend tsc --noEmit PASS. No real PostgreSQL or authenticated browser E2E executed.

End: Full build, lint, security audit, app-api, backend, isolated Test exact-SHA and release gates NOT VERIFIED. Do not merge/deploy without all required gates. Main must be fetched again before any merge. Existing unmerged PRs preserved. Production/Test unchanged, rollback not needed.
