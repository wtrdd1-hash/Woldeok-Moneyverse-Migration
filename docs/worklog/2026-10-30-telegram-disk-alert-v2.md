# v2026.10.30.2 — Critical disk-capacity Telegram alarm

## Before work — 2026-10-30 09:10 KST
- Owner requested alert system recheck. In v1 audit, root and second disk both had raw used/total ~92.7%, but only ~3.03 GB and ~5.77 GB actually available. df showed 97/98% full.
- Root cause: existing Telegram bridge computes used/total only, ignoring Linux reserved/unavailable space; it reports WARNING instead of CRITICAL at an actual available-capacity ratio below 5%.
- Source authority: AGENTS.md, integrated master, release policy and latest origin/main including the v1 timer repair; separate branch prevents overlaps with other agents. No disk deletion is authorized by this task and no finance data mutation is required.
- Plan: RED test to assert effective capacity from total minus available; GREEN implementation; isolated Test and actual host snapshot; CI/PR, standalone Python install and live critical alert/receipt; bilingual changelogs and exact records. No app restarts, no secret exposure.

## During work — RED/GREEN
- RED regression: mocked device 100 total, 93 used, 3 available returned WARNING 93%, failing expectation CRITICAL 97%.
- GREEN: use (total - free) / total for service-effective utilization. All 25 Python tests pass.
- Actual read-only host snapshot after source fix: system disk CRITICAL 97%, second disk CRITICAL 97% (different rounding than df human-readable 98%). No cleanup or data mutations.
