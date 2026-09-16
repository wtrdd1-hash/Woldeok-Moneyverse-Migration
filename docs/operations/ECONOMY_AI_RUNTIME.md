# Moneyverse Economy AI Runtime

> Version: v2026.09.16.141
> Korean counterpart: [ECONOMY_AI_RUNTIME.ko.md](ECONOMY_AI_RUNTIME.ko.md)

## Host storage
- `/dev/sda`: 32 GB system/application disk. Do not store model weights here.
- `/dev/sdb1`: 100 GB data disk mounted at `/srv/moneyverse-data`.
- AI root: `/srv/moneyverse-data/ai/{models,adapters,cache,datasets,evals,logs}`.

## Council topology
Six domains run two seats each: `macro`, `shop`, `stock`, `jobs`, `welfare`, `integrity`. Each seat makes an independent judgment, then challenges its domain peer. The scheduler stores the final 12 seat artifacts and a council aggregate. Classical policy remains the fallback/authority lane.

## Model configuration
Global fallback variables: `ECONOMY_AI_API_BASE_URL`, `ECONOMY_AI_MODEL_A`, `ECONOMY_AI_MODEL_B`, optional `ECONOMY_AI_API_KEY`. `ECONOMY_AI_MAX_CONCURRENCY` limits simultaneous calls (default 2; use 1 for local single-model inference). Per-domain overrides use `ECONOMY_AI_<DOMAIN>_<A|B>_{API_BASE_URL,API_KEY,MODEL}`. Use different model families/checkpoints/adapters for A/B where practical.

## Resource rule
Remote inference: current host memory is sufficient. Local inference: keep model residency bounded; do not load twelve models concurrently. With ~13 GiB RAM, run one small quantized model at a time. For two 7–8B Q4 models plus backend/DB headroom, prefer at least 32 GiB RAM. Disk expansion is not currently required because the data disk has ~85 GB free.

## v2026.09.16.143 remote-inference optimization
- Route only domains implicated by proposal knobs; macro, welfare and integrity remain mandatory sentinels.
- Skip rebuttal for low-risk unanimous no-risk first-pass decisions.
- Rebut only disputed domains; high-risk controls rebut every selected domain.
- `ECONOMY_AI_MAX_CONCURRENCY` bounds remote/local pressure; default 2.
- `ECONOMY_AI_CACHE_TTL_SECONDS` caches an exact proposal+model council result briefly; default 300 seconds.
- Council evidence records latency and provider token usage when supplied.
- `economy_ai_agent_scoreboard` exposes per-domain/seat/model volume, decision mix, confidence, latency and token usage for later quality/cost evaluation.
