# Repair standalone CI classification for accidentally tracked root commit message

Status: engineering candidate / release hold. Base `033ac0ff9671a5f53b41c97eaa1ec9593453dfc0`.

## Reproduction / design

Standalone main CI run 40049145905 fails `classify` before policy/runtime checks. The 5072d43e..033ac0ff diff contains an accidentally committed root `commit_msg.txt`, which is intentionally UNKNOWN under the fail-closed classifier. Deleting the artifact without a narrow classification rule would make the deletion itself UNKNOWN on the repair PR. Treat only this exact legacy artifact as release-control metadata, remove it from tracked source, and keep all other unexpected root `.txt` paths UNKNOWN. Do not broaden the general whitelist or bypass the classifier. Do not change runtime, migrations, financial state, other developer branches, or production.

## Execution steps

1. RED: extend `scripts/release/classify-release.test.mjs` with exact `commit_msg.txt` classification, mixed-with-runtime classification, and fail-closed unexpected root text regression. Verify new test fails on main implementation.
2. GREEN: add exact root filename to `CONTROL_PATHS` in `scripts/release/classify-release.mjs` and delete tracked `commit_msg.txt`. Confirm focused and security tests, run actual classification against original main commit and candidate diff.
3. Verify repository policy, lint/typecheck/build/full tests where feasible; preserve any FAIL and exact SHA. Recheck origin/main and project plans before PR; record English-first and Korean-second worklog/release evidence. Draft PR only, never merge/deploy without full gates and isolated Test evidence.
