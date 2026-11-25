# GitHub update vAUTO.FE.TEST.2026.11.23.3: FE automation to isolated Test

Updated and verified five active automations: FE-A :05, QA1 :15, FE-B :25, FE-C :45, and QA2 browser E2E plus sole scoped Test deployment :55 KST. Existing QA2 moved from :35. A separate sixth automation cannot be created because this plan has a five-task limit.

Source pin: corrected 180-page v2026.11.23.10 designs, immutable GitHub commit 39888c7d26bdf688737a77b93a7da29e230b4168, PR #3400 closed but not merged. Main integrated plan remains higher-priority authority.

All FE prompts now demand actual Spring MVC+Thymeleaf website code, design token/favicons, five locales, real API/DB and route/state/responsive QA; QA1 validates Test backend/ledger, QA2 validates real browser and stage→lock→gated atomic Test release→HTTPS smoke→rollback. FE workers cannot concurrently deploy Test.

Existing Test blockers (114 of 147 fixed routes return 403 under guest check, legal endpoints and Socket.IO script 403, null title, 33 dynamic fixtures) are explicit priorities, not misreported as complete. Partial safe scoped Test improvements may deploy after required checks; full 180/240 acceptance must not be claimed until proven.

Docs-only change; no code, database, Nginx, Production, protected main or current Test release mutated. [EN operating protocol](../operations/2026-11-23-auto-fe-test-promotion-vAUTO.FE.TEST.2026.11.23.3.md), [KO](../operations/2026-11-23-auto-fe-test-promotion-vAUTO.FE.TEST.2026.11.23.3.ko.md).