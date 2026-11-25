# Four guarded agent skills — v2026.11.24.1431

**Scope:** Skill registration only; not runtime acceptance. **Server time:** 2026-11-24T14:31:56+09:00. **Main baseline:** `9876c09888ec84034eec183cf1309c85df3d7447`.

Source: https://www.instagram.com/reel/DfeZ0sFzEn7/ (owner-provided caption screenshot; video not independently verified).

## Work and evidence
- Start: inspected mini-PC environment and existing skill directories; no matching paths found. Node 24, tmux available; approximately 1.5 GiB available RAM, 12 GB free disk.
- Checkpoint: refreshed main, reviewed integrated planning and shared memory protocol. The branch's newer DOCUMENT_AUTHORITY file was absent from fetched main; do not infer branch/main parity.
- Pinned upstream sources and verified SHA-256 of three upstream skill files; installed guarded local wrappers with original files retained as references. Created a local Repolyze public-review adapter because upstream has no SKILL.md.
- Finish: four names (`rigs`, `hindsight-local`, `mineru`, `repolyze-public-review`) in `~/.agents/skills`, linked into Claude, Codex and Gemini; 16/16 file paths verified. Client discovery in live sessions and runtime functionality NOT tested.

## Sources
- rigs: https://github.com/mvschwarz/openrig — `255fa70888fbcb8f62df3b31c7d3b5e81e2447dc`
- hindsight-local: https://github.com/vectorize-io/hindsight — `535eb6d708c95b531162b08a959f162fe891b3bc`
- mineru: https://github.com/opendatalab/MinerU — `097de7f63f54722c9b805ee1c9a14a0c5b02e078`
- repolyze: https://github.com/MxCorpIn/Repolyze — `042469ec176dbf322320348a865eea3d52b5ced6`

## Boundaries
No OpenRig team, Hindsight capture hooks, external memory, MinerU models or services, Repolyze app/API, permissions changes, private repository uploads, application changes or deployments. Hindsight raw transcripts and private financial/customer data prohibited; existing GitHub worklogs remain authoritative. Repolyze public repositories only; scoring is not security certification. Separate isolated runtime pilot and explicit review required before use. No production promotion.
