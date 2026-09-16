# Moneyverse Economy AI Runtime

> Version: v2026.09.16.160
> Korean counterpart: [ECONOMY_AI_RUNTIME.ko.md](ECONOMY_AI_RUNTIME.ko.md)

## Authority and topology
The deterministic/classical economy engine remains the accounting, bound and policy authority. The AI lane reviews an exact classical proposal and may append `agree`, `veto` or `abstain` evidence; it cannot write replacement policy values. Missing, expired, mismatched or unavailable AI evidence falls back to the classical lane.

Six domains run A/B specialist seats: `macro`, `shop`, `stock`, `jobs`, `welfare`, `integrity`. Only proposal-relevant domains are routed, with macro/welfare/integrity always present. Disputed or high-risk domains can receive a rebuttal pass. Exact proposal hashes, expiry, council evidence, latency and token usage are persisted for arbitration and scoring.

## Host storage and service
- `/dev/sda`: ~30 GiB system/application filesystem; do not store model weights here.
- `/dev/sdb1`: ~98 GiB data filesystem mounted at `/srv/moneyverse-data`.
- AI root: `/srv/moneyverse-data/ai/{models,adapters,cache,datasets,evals,logs,runtime}`.
- Local inference service: `moneyverse-economy-ai.service`, bound to `127.0.0.1:11434` only.
- Ollama cloud is disabled. Models and runtime stay on the data disk.

## v2026.09.16.160 production model profile
- Seat A: `llama3.2:3b`.
- Seat B: `gemma3:1b`.
- Backend endpoint: `http://127.0.0.1:11434/v1`.
- `ECONOMY_AI_MAX_CONCURRENCY=1`, `ECONOMY_AI_TIMEOUT_MS=180000`, `ECONOMY_AI_CACHE_TTL_SECONDS=300`, `ECONOMY_AI_REVIEW_TTL_MINUTES=120`.
- Inference service: at most two resident models, one parallel request, 2-minute model keep-alive, `MemoryHigh=6G`, `MemoryMax=7G`.
- The current host has about 10 GiB RAM plus swap. Do not move to two 7–8B resident models on this host; prefer at least 32 GiB RAM for that class of local dual-model deployment.

Per-domain/per-seat overrides remain available as `ECONOMY_AI_<DOMAIN>_<A|B>_{API_BASE_URL,API_KEY,MODEL}`. Global fallbacks are `ECONOMY_AI_API_BASE_URL`, `ECONOMY_AI_MODEL_A`, `ECONOMY_AI_MODEL_B` and optional `ECONOMY_AI_API_KEY`.

## Activation evidence
- Existing reviewer unit tests passed 10/10.
- The selected A/B models passed the runtime JSON contract with confidence in `0..1`; a Qwen candidate that violated this contract was rejected.
- Isolated Test exercised real model calls, append-only storage, scoreboard evidence, exact-hash agree, exact-only veto, mismatch fallback and unconfigured fallback.
- Production `economy_ai_policy_review` was first enabled by the audited admin switch path under the provisional v159 operation label; the append-only v159 receipt was preserved and a later audited v160 receipt reconciled the current switch reason after the Work reset version collision.
- The first enabled production review returned `no_eligible_classical_proposal`; no policy values changed and no production AI review row was created. Rejected/unused model artifacts were removed after QA; only `llama3.2:3b` and `gemma3:1b` remain, using about 2.7 GiB of the local model store.

## Operations and rollback
Monitor feature-switch state, reviewer outcome, `economy_ai_agent_scoreboard`, model latency/tokens, service memory, backend errors and reconciliation signals. A model-quality regression must not weaken deterministic checks.

Rollback is fail-safe: disable `economy_ai_policy_review` through the audited admin function, restore the pre-activation backend AI environment if needed, restart the backend, and stop/disable the local inference service if it is no longer required. The classical policy lane remains available throughout.
