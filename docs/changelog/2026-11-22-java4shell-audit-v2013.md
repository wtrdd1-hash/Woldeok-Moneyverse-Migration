# v2026.11.22.2013 — Security documentation delta (EN)

- Added paired EN/KO Java4Shell source verification and read-only host/JVM audit findings.
- Logged 32 Java processes: 28 running old Java 21.0.12.1; one running patched 21.0.13.1; three runtime-unverified. Primary Spring runtime patched; host CPU does not expose AVX-512 VBMI.
- Added paired GitHub-facing and internal update notes plus task start/checkpoint/finish record. No app, OS, database, Nginx, Test, or Production mutation.
- **No claim of remediating old JVMs or completing a release.**

[Findings](../findings/2026-11-22-java4shell-runtime-audit-v2013.md) · [Worklog](../worklog/2026-11-22-java4shell-runtime-audit-v2013.md)
