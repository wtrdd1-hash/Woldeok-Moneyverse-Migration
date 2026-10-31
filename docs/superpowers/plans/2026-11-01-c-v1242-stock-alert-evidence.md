# Stock-alert evidence verification — implementation plan

**Goal:** Do not render or permit changes against unverified owner alert data.
**Architecture:** Keep Nest owner-scoped PostgreSQL read functions and Next authenticated API unchanged. Add a small pure runtime parser for three response bodies, fail closed in the server page, and retain the existing client form only for verified data. No new writes or schema.
**Tradeoffs:** Reject an entire inconsistent snapshot rather than drop individual invalid rows or fabricate empty data. Retain existing 200 verified-empty semantics; avoid inferring freshness beyond the API read.

1. Add parser tests covering valid empty/filled data, absent arrays, duplicate IDs, malformed WLD integers, threshold kind mismatch, dates, and invalid change basis points. Run RED.
2. Implement parser with exact integer-string and UUID/date checks, no coercion. Run GREEN.
3. Connect server page to parser and add accessible keyboard retry/error; add page rendering regression. Run targeted tests.
4. Fetch latest main and recheck active PRs, run full exact-SHA lint/typecheck/build/unit/contract/security/isolated PostgreSQL/E2E where feasible; preserve failure logs.
5. Write EN/KO final log and push independent Draft PR. Merge/release only after every required gate PASS.
