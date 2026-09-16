# Economy AI local runtime

> Version: v2026.09.16.160
> Korean operational detail: [`../docs/operations/ECONOMY_AI_RUNTIME.ko.md`](../../docs/operations/ECONOMY_AI_RUNTIME.ko.md)

This directory stores the non-secret, reproducible host profile for the local economy-AI inference lane. The deterministic economy engine remains authoritative.

## Install/update
1. Keep the Ollama runtime and model blobs under `/srv/moneyverse-data/ai`, not the system disk.
2. Copy `moneyverse-economy-ai.service` to `/etc/systemd/system/`, run `systemctl daemon-reload`, then enable/start it.
3. Apply the variables from `economy-ai-backend.env.example` to Test first. Never add provider/API keys to Git.
4. Verify both selected models return the reviewer JSON contract before enabling `economy_ai_policy_review`.
5. Use the audited admin feature-switch function for Test/Production state changes where an administrator exists.

## Verify
- `systemctl is-active moneyverse-economy-ai.service`
- `curl -fsS http://127.0.0.1:11434/api/tags`
- backend reviewer unit/integration tests
- Test exact-hash agree/veto/mismatch/unconfigured fallback
- Production reviewer must not alter policy when there is no eligible proposal

## Rollback
Disable `economy_ai_policy_review` through the audited admin path first. Restore/remove backend AI variables, restart backend, then stop/disable the inference service if unused. Classical policy must remain available throughout.
