# Test frontend with real backend — 2026-11-23

> Current runtime acceptance HOLD — 2026-11-24. A different JAR retains the old7b build identity. Earlier Test acceptance is historical, not current. [Latest diagnosis](../qa/2026-11-24-frontend-diagnosis.md) / [한국어](../qa/2026-11-24-frontend-diagnosis.ko.md).


## Current checkpoint — accepted Test connection slice

Finished: independent Test frontend connection, exact CI artifact, shared locale/favicon/support corrections, and the listed240-case common-screen browser matrix. Whole180-route implementation and authenticated/admin/financial acceptance remain OPEN. No Production promotion.

Running application7b676e602bc984ab74572d4081655fdb297d176a is distinct from backendf0336fded6068f884c87f88efedeb770fd3387d4 and the later consolidated GitHub tip. The actual backend process targets the isolated Test PostgreSQL. No claim is made about unobserved process flags or unchanged backend PID across concurrent work.

[Current detailed QA and limitations](../qa/2026-11-23-test-frontend-real-backend.md).

## Before work
Owner narrowed the task to Test only. Production promotion is not authorized for this continuation.
Use UI_UX_SINGLE_REFERENCE.ko.md at design revision39888c7d26 and retain exact favicon bytes. Current origin/main9876c09888 is an ancestor of the design candidate.
Observed Test HTML proxies to the same4550 runtime as Production; Test /frontend-version returns503 BUILD_IDENTITY_UNAVAILABLE. This is not an independent frontend candidate.
Existing private synthetic Test PostgreSQL and real Spring API55438 remain the backend authority for this task. No mock responses, Production credentials, customer records, or financial writes are introduced.
The prior frontend rebuilding plan remains the approved implementation scope. This continuation first makes its completed native slices independently reviewable on Test;180 route acceptance remains OPEN.

## In progress
- [x] Re-read project instructions, release/infrastructure authority and supplied single reference.
- [x] Isolate work on MiniPC; preserve previous dirty worktrees and concurrent changes.
- [x] Establish baseline native tests.
- [x] Verify game-world shared styling, actual favicon and no invented runtime values by real rendering.
- [x] Bind independent frontend to real Test backend; no Production fallback.
- [x] Candidate CI and exact source identity.
- [x] Test-only routing ownership/recovery checks and Production byte preservation; final7b actual rollback not exercised.
- [x] Listed common-screen PC/mobile/five-language and real read-API evidence; full functional acceptance OPEN.
- [x] Publish results and remaining defects in versioned QA evidence.

## Finished
The connection/common-screen milestone is finished as scoped above. Whole-site implementation remains unfinished. Production promotion has not occurred.

### Checkpoint — baseline / first regression
Native baseline662tests, zero failures/errors/skips. PostgreSQL-tagged tests excluded by project default are not counted as passes. Six Test routing isolation tests RED (missing module) then GREEN. Real-render branding regression5/5 fails on the existing administrator letter emblem before correction. Replaced only that pseudo-element with the byte-identical current favicon and updated resource content hashes.

### In-progress validation checkpoint
Real-render branding5RED->GREEN; complete native Java667/667, node351/351, zero failures/errors/skips. Nine routing/provenance/CAS tests pass. Required PostgreSQL-tagged tests are excluded locally, not claimed passing. Existing real Test API session/stocks/board/wallet summary each returned200 with expected object fields. No runtime change yet. Fresh review and exact candidate CI precede Test-only activation.

### Fresh review / one fix pass
Reviewer found two P1 shared-file concurrency hazards before activation: separately captured bytes/identity and adopting a post-replacement foreign occupant. Three regressions observed RED; fixed by consistent fd capture and the previously reviewed NOREPLACE displacement/acquisition writer. It preserves displaced inodes in private recovery directories, verifies the actual displaced occupant, never replaces a foreign occupied path, and records only the acquired candidate identity. Full14Python tests GREEN, including post-comparison race, post-acquisition foreign write and successful inverse. No further review loop; covering tests answer the findings.
Application source and operational source are distinct: an attested candidate may remain in use across a pushed operations/docs-only checkpoint only when Git ancestry and exact changed-path allowlist prove application bytes unchanged. A new application change always requires its own candidate. Production promotion remains forbidden.

### Actual candidate pre-activation check
Exact candidate45129839159 completed successfully; four required checks PASS, build PASS; the non-runtime summary is inapplicable/skipped. Downloaded archive SHA256d1413358db8b345923e01a87d14d29acc026a05d65f8dbb69e284e805f119a22; application JAR SHA2565e6e6a92cc0a2a52b7396982015f29788db678ca0610053e9c4473ac4bec6f9a. Initial helper inspection stopped before unit/stage/config acquisition because build-info was assumed under BOOT-INF/classes. Actual immutable CI JAR has META-INF/build-info.properties. Corrected the fixture to the real archive layout, observed RED, corrected the exact path, full14GREEN. No gate was skipped and no app identity was relabeled.

### Test ingress readiness follow-up
First activation installed the exact candidate as owned PID1789261 and its direct55440 version returned the correct JSON/source. The first immediate request after asynchronous Nginx reload still returned old HTML, so acceptance correctly failed and the guarded inverse restored prior routing. No browser acceptance was claimed. Replaced a one-shot origin assertion with bounded readiness that accepts only the exact source while repeatedly checking owned config identity. Added a resume action restricted to the actual previously acquired unit/PID/JAR, verified own restored config and unchanged prepared transformation; history is retained. Two readiness regressions RED->GREEN, full16Python tests pass. The asynchronous-reload hypothesis will be confirmed or rejected by the resumed actual Test check; it is not yet called solved.

### Actual Test browser failure — language precedence
First actual browser matrix failed on the second case: /?lang=ko at320px stayed English after the English case. Server resolve() ignored the explicit query; resolvePublic() put a stale cookie first; client i18n also ignored URL choice and could retain saved storage. Added6Java tests (5expected failures observed),2Node regressions (both failed), request-first selection in both server/client, in-place URL synchronization without reload/draft loss, and shared game-guide translations. Full suite is running. The tested5e frontend remains connected on Test, but this language defect is OPEN until a new exact artifact and full browser run pass. Production remains unchanged.

Ruling: explicit supported URL language wins over stale persisted language, then manual cookie/browser fallbacks apply. Existing native integration tests deliberately encoded the opposite order; aligned their conflict assertions to the corrected request contract and retained/additionally verified cookie-without-query fallback. No authorization, source-data, amounts, financial or security assertions were removed. Cost if wrong: direct links would choose a language ahead of a saved preference; this matches actual browser language selection and the explicit-language fix already prepared in another branch.

### Corrected locale source checkpoint
Full Java673/673, Node353/353, Python19/19 pass; no local failures/errors/skips in those suites. PostgreSQL-tagged tests remain separately excluded. Actual180route anonymous matrix:15HTML,14auth-required,33dynamic-fixture-required,117not-connected404,1unavailable503(/status). This is not full-feature acceptance. Added a narrow own Test-unit upgrade with exact CI artifact and predecessor PID/JAR/CWD/open-FD authority;3new helper tests RED->GREEN. A fresh review covers this newly added upgrade scope before any upgrade.

### New upgrade scope review — one fix pass
P1 recovery coverage began too late; P2 startup verification could abort on a pending JVM; P2 duplicate lang parameters differed between server/client. Regressions RED->GREEN for durable pre-link inode intent (actual subprocess exit99 immediately after linking), missing post-exchange receipt, held predecessor/foreign refusal, delayed JAR/open-FD, process exit and duplicate locale fallback. Recovery now encloses stop/exchange/start and supports original/candidate/displaced phases. Full22Python tests pass; final UI Java674/Node354 pass. No fresh review loop is needed for these covered findings.
CI8394584d failed closed before runtime work because nested QA JSON files were outside the existing approved flat QA-document rule. Moved evidence to the existing accepted flat docs/qa JSON locations; classifier policy was not changed. Those failed/skipped jobs are not reported as passing. A new source candidate will be verified.

### Actual corrected-locale Test result / next UI defect
Candidate dbac9864e9289f550200971e7b9162a5a1e034be passed exact CI45134814585 and upgraded only the own frontend to PID1837585; Nginx/API/DB/Production unchanged. Actual browser home40/40 across8widths/five locales passed, then tools320px failed because fixed support56px intersects #hub-q by5.25px (input top772.75, launcher bottom778 at860px viewport). Full240 acceptance is not claimed.
Ruling: support remains56px with the same modal, but gets a reserved slot in the shared member/admin toolbar at every width. This removes the root cause of overlays covering forms, rather than tuning a fragile bottom offset for one page. Cost: it moves the launcher from the lower-right overlay to the common toolbar. Five real-render locale regressions failed before this change; the full Java/Node suites are running.

### Toolbar source validation checkpoint
Five real-render regressions observedRED before moving the56px launcher into the shared member/admin toolbar. Full Java674 and Node354 nowPASS, zero failures/errors/skips; Python22 stillPASS. Actual240-case browser run is required on the new exact artifact, not inferred from these tests. The current Test source remainsdbac with the recorded overlap until that candidate replaces it. Current favicon bytes were measured equal at Production favicon, Test favicon, Test branded asset and repository: SHA2567c17c9be67fb26d74879b5392423e736ed7079a3c00e5a203adcecddf35fa3d5. No Production changes.

### Development browser preflight / concurrent Test configuration
A private loopback development build of exact source7b676e602bc984ab74572d4081655fdb297d176a, using real isolated Test API55438 through a dedicated temporary proxy, passed240/240 and calculator/search/menu/modal interactions. This local-JAR result is not public Test/CI-artifact acceptance. Temporary developer units were ownership-verified and both stopped; no Production/runtime proxy change.
The first new-toolbar probe incorrectly classified its own ancestor header as overlap. Corrected only ancestor containment, retaining header-peer/main-control checks; forced a real control collision and verified the guard rejects it. This guard self-test passes.
Public upgrade of the attested7b candidate stopped before any transition because parallel Test-only API/OAuth/socket routes had been added. The old Test renderer stayed healthy. Added an exact reviewed compatibility tail, all upstreams55438/55440, while retaining the entire canonical page/asset/read prefix and refusing Production upstreams or modified guards. No Nginx write is performed by this upgrade. The actual complete site snapshot must still stay unchanged. One new boundary test RED->GREEN; full23Python tests pass. The parallel routes themselves are not claimed as business-operation acceptance.

### Finished milestone — exact Test artifact and recorded gaps
Actual source7b676e602bc984ab74572d4081655fdb297d176a was installed from successful candidate CI45139863605 with JAR SHA256a751dc6b8760967c7e3e8bcb7ca0c30fd1a73e9ad7df09548de66fe3a6893706. The Test-only unit upgrade and QA preserved the full existing Nginx snapshot; earlier owned development units were verified stopped.
The240-case fresh-browser matrix and interactions passed with zero failures; a forced control-overlap self-test also passed. Transport was actual Test Nginx HTTP through Test-hostname loopback resolution, with separate external HTTPS200/exact-source verification. It is not240external TLS tests. The original favicon matches at all measured locations.
Latest anonymous180GET inventory:15HTML,14auth-required,33fixture-required,117HTTP403,1HTTP503. The117403s are not implemented pages. /status remains a real backend read-boundary defect; member/admin positives, OAuth and financial writes remain unaccepted.
Application validation recorded Java674, Node354 and operations23 with zero failures; locally excluded PostgreSQL-tagged tests are not counted passing. The exact CI required jobs succeeded. Final7b actual rollback/host reboot was not exercised.
During final GitHub reconciliation, PR3402 was found closed unmerged and the shared remote task branch had advanced fromc437ccab6a to1ecf461fc8 through parallel consolidation into PR3407. Preserve it. Documentation evidence moved to docs/test-frontend-acceptance-evidence-20261123 based on that tip; no additional application changes were deployed or accepted. origin/main was fetched again and remained9876c09888ec84034eec183cf1309c85df3d7447.
Production was not promoted. The recurring Test-before-Production rule is recorded on the task branch, not claimed merged to main. Complete functionality remains OPEN as listed in QA.

### Before work — 2026-11-24 expanded diagnosis
Owner requests comparison of all MiniPC/GitHub work, why the UI differs from the approved design, and why some pages are blocked. Continue read-only runtime/source/ingress/security comparison. Do not infer that earlier240-case evidence accepts another application SHA or every route.
- [x] Inventory active public Test/Production identities, presentation/API boundaries and worktrees.
- [x] Compare GitHub integration/PR/source and design authority.
- [x] Reproduce representative missing, denied, login-required and source-failed routes at each boundary.
- [x] Inspect actual desktop/mobile page styling and classify visual defects.
- [x] Publish evidence-linked causes and remaining actions without Production promotion.

### Finished diagnosis — 2026-11-24 (implementation defects remain OPEN)
Inspected28worktrees/36running related services/70recent PRs,294anonymous routeGETs,24origin-browser views and5externalHTTPS screens. Added paired diagnosis and sanitized evidence. Found34entry drift from the attested7b JAR while retaining its identity; missing native handlers causing403; Production design-example shop; broken legacy CSS502 and edge-only public.js403; incompatible shared CSS versions; favicon-to-W and mobile support-overlap regressions; socket404; Test status raw-table SELECT nowtrue. Current state is HOLD, not240cases accepted.
Do not misreport inactive retired unit names as site downtime. Four worktrees are dirty; preserve them. Main remains9876c09888; consolidated remotea61 has77unmerged commits and failing runtime/Spring checks. No Production deploy, service shutdown, grant mutation, branch deletion or application-code repair in this diagnosis. Old status503/7b acceptance records are superseded by the current time-bounded observations.

### Evidence-branch integration checkpoint
Brought this documentation branch up to the observed consolidated basea61f6d8b9d so its PR can compare an ancestral base. Preserved incoming application code without deploying it. The PR diff remains documentation/evidence only; failing application checks on the base are not repaired or accepted here. JSON/local-link validation, staged diff check,6security guard regressions and actual repository/control-byte scans passed before publication. Diagnosis PR3420 remains Draft; main and Production unchanged.
The incoming base contains existing auth.html trailing whitespace. It was preserved; the actual documentation-only PR diff was checked against MERGE_HEAD and passed. No application-byte modification was introduced to make this audit green.
