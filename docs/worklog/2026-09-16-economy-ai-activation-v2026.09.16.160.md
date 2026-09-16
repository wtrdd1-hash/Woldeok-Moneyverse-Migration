# v2026.09.16.160 — Economy AI production activation

- Date: 2026-09-16
- Branch: `ops/economy-ai-activation-v2026.09.16.160`
- Documentation base: `03a8ae9c5313d0915589691afc6fff022323c305`
- Activated application runtime: `be218f0403372689dbdf8af9bf8700264f39348f`
- Korean counterpart: [2026-09-16-economy-ai-activation-v2026.09.16.160.ko.md](2026-09-16-economy-ai-activation-v2026.09.16.160.ko.md)
- Version note: `v2026.09.16.159` was consumed by the Work day/week reset merge while this operation was in progress, so the documentation/integration version moved to `v2026.09.16.160`. The earlier v159 activation receipt remains append-only audit history; a v160 normalization receipt records the final switch reason.

## Scope
This operation activates the already-deployed dual economy-AI review lane. It does **not** deploy current `main`, change ledger/policy schema, or bypass the deterministic economy engine. Classical policy remains authoritative and is the outage/missing-review fallback.

## Runtime installed
- Local OpenAI-compatible inference is bound to `127.0.0.1:11434` and runs as `moneyverse-economy-ai.service`.
- Runtime and model data live under `/srv/moneyverse-data/ai`; no model weights are stored on the constrained system disk.
- Seat A: `llama3.2:3b`; seat B: `gemma3:1b`. A rejected `qwen2.5:3b` candidate emitted an out-of-contract confidence value and was not selected.
- The service allows two loaded models, one request at a time, a 2-minute model keep-alive, and bounded memory (`MemoryHigh=6G`, `MemoryMax=7G`). Ollama cloud access is disabled.
- Backend config uses 180 s per-call timeout, concurrency 1, 300 s exact-result cache and 120 min review TTL.

## Test evidence
- Existing `economy-ai-review.test.ts`: 10/10 passed.
- Both selected models returned the required `decision/confidence/rationale/risks` JSON contract with confidence in `0..1`.
- The validation process used the deployed `test-be218f040337` application release with the authoritative Test DB; the public Test route still reports `be218f...` and therefore does not constitute current-main exact-SHA release evidence.
- Isolated Test synthetic proposal exercised the real reviewer and Test DB storage: 4 routed domains, 8 seat calls, `council_agree`, aggregate confidence `0.9625`, about 60.4 s elapsed.
- Exact proposal hash returned `dual_agree`; a one-value proposal change returned `ai_missing_classical_fallback` and did not inherit the prior review.
- Null model configuration returned `unconfigured_classical_fallback`.
- A Test-only stored veto blocked the exact proposal with `ai_veto`; a changed proposal remained unblocked.
- Application-role direct reads of `economy_ai_policy_reviews` were denied as designed; writes/reads used the protected functions and scoreboard/read models.

## Production activation
- Production backend received the same selected-model configuration and restarted healthy before the feature switch changed.
- `economy_ai_policy_review` changed from `disabled` to `enabled` through `admin_set_feature_switch`; the initial enable receipt records the provisional v159 reason, and a second audited `enabled -> enabled` receipt records the final v160 version-reconciliation reason.
- A post-activation production reviewer run returned `no_eligible_classical_proposal` in about 40 ms. No model council was called and no economy policy was changed.
- Public `/api/version` remained `be218f0403372689dbdf8af9bf8700264f39348f`; the public home page returned HTTP 200 and backend/AI services remained active without matching fatal/error/OOM log entries in the activation window.
- Production review count remains zero until an eligible exact classical proposal exists. The previous weekly scheduler receipt still says `disabled` because it ran before activation; the next weekly review period will evaluate the enabled switch.

## Safety and rollback
- AI cannot write replacement policy values. It can only append a review and veto the exact matching current proposal; disagreement, missing review, model outage or missing configuration preserves the classical fallback path.
- Rollback order: set `economy_ai_policy_review=disabled` through the audited admin function, restore the pre-v160 backend environment file, restart the backend, then stop/disable the local inference service if it is no longer required.
- Continue watching agent confidence/latency/token metrics and council decision mix. Small local models remain advisory safety reviewers, not the accounting or settlement authority.
