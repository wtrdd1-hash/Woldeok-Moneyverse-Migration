# OmniRoute isolated installation — v2026.11.24.1345

Owner authorized installation after feasibility review PR #3434. Official https://github.com/cheaper-inference/OmniRoute image 3.8.54 pinned by manifest digest `sha256:2c4c755a54f8ce5341bc1856580b71f47a0f16a9afab4a55f84d540810631f68`. Development-only gateway container `moneyverse-omniroute-local`, independent bridge network and persistent volume. Host loopback endpoint `http://127.0.0.1:20128`, no public proxy or extra exposed ports. API key required; generated per-instance secrets stored in restricted local env file (never committed). No upstream provider accounts or client routing configured. No customer data or credentials sent to an AI provider.

Resource constraints: 2 GiB container memory and equal memory+swap cap, 1024 MiB V8 heap, 0.75 CPU, 256 PID limit, no-new-privileges, all capabilities dropped; bounded container logs. Healthy, OOM=false; /api/health HTTP 200; unauthenticated /v1/models and synthetic chat both HTTP 401. Dashboard redirects (307); authenticated login and actual provider inference not yet tested. Snapshot 479.9 MiB memory. Restart policy unless-stopped. Existing Moneyverse app/Test/Production deployments and agent routing unchanged. Dashboard/light smoke only, not coding-agent capacity certification. Host shared RAM and disk must be monitored; stop this container if pressure occurs. Existing release gates remain binding.

Access remotely using a trusted SSH local port forward to 127.0.0.1:20128 if SSH access is configured. Initial password in the owner-only runtime.env under ~/skill-install-records/v2026.11.24-omniroute-install/ (do not commit or print in logs). Stop: `docker stop moneyverse-omniroute-local`; restart: `docker start moneyverse-omniroute-local`. Preserve the volume for rollback. Do not connect providers or enable paid fallback without explicit configuration.

## Server time log
```text
2026-11-24T13:43:50+09:00 START: owner explicitly authorized installation; isolated local instance, no provider routing changes
2026-11-24T13:44:35+09:00 CHECKPOINT: reviewed upstream docker and env configuration
2026-11-24T13:45:10+09:00 CHECKPOINT: pinned image pulled; pending bounded runtime smoke
2026-11-24T13:45:28+09:00 CHECKPOINT: isolated bounded container created and health probe performed
2026-11-24T13:45:37+09:00 FINISH: health healthy, loopback-only published port, unauthenticated inference HTTP 401, restart unless-stopped; provider accounts unconnected; no Moneyverse runtime changes
```
